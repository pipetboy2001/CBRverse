import { useState, useEffect, useRef } from 'react';
import type { Archive } from '../types';

const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

// Promesa compartida a nivel de módulo: window.loadArchiveFormats/jszip/libunrar
// son estado global de la librería vendored, así que la carga también tiene que
// coordinarse a nivel global. Sin esto, el doble montaje de React StrictMode en
// desarrollo dispara este efecto dos veces y la segunda vez nunca llega a
// llamar setupDragAndDrop (ver issue #26).
let archiveLibsReady: Promise<void> | null = null;

const ensureArchiveLibsLoaded = (): Promise<void> => {
  if (!archiveLibsReady) {
    archiveLibsReady = (async () => {
      if (!window.JSZip) {
        await loadScript('/lib/jszip.js');
      }
      if (!window.loadArchiveFormats) {
        await loadScript('/lib/uncompress.js');
      }
      if (window.loadArchiveFormats) {
        await new Promise<void>((resolve) => {
          window.loadArchiveFormats!(['rar', 'zip'], resolve);
        });
      }
    })();
  }
  return archiveLibsReady;
};

// Progreso de lectura por cómic, identificado por nombre+tamaño de archivo
// (no hay hash de contenido ni biblioteca persistente todavía).
const PROGRESS_STORAGE_PREFIX = 'cbrverse:lastPage:';

const getComicKey = (file: File) => `${file.name}:${file.size}`;

const getSavedPage = (key: string, totalPages: number): number => {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_PREFIX + key);
    const page = raw ? parseInt(raw, 10) : NaN;
    return Number.isInteger(page) && page >= 0 && page < totalPages ? page : 0;
  } catch {
    return 0;
  }
};

export const useComicReader = () => {
  const [images, setImages] = useState<string[]>([]);
  const [currentPanel, setCurrentPanel] = useState<number>(0);
  const [comicName, setComicName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [showButtons, setShowButtons] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const comicKeyRef = useRef<string | null>(null);

  // Guarda la página actual para retomar en la misma donde se quedó
  useEffect(() => {
    if (!comicKeyRef.current || images.length === 0) return;
    try {
      localStorage.setItem(PROGRESS_STORAGE_PREFIX + comicKeyRef.current, String(currentPanel));
    } catch {
      // localStorage puede no estar disponible (ej. navegación privada); no es crítico
    }
  }, [currentPanel, images.length]);

  // Libera las blob URLs de las páginas cada vez que se reemplazan (nuevo cómic, cierre, o unmount)
  useEffect(() => {
    return () => {
      images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  // Initialize external scripts
  useEffect(() => {
    let cancelled = false;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "move";
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;
      if (files.length > 1) {
        doError("You may only drop one file.");
        return;
      }

      handleFile(files[0]);
    };

    const setupDragAndDrop = () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
      document.addEventListener("dragover", handleDragOver);
      document.addEventListener("drop", handleDrop);
    };

    ensureArchiveLibsLoaded()
      .then(() => {
        if (!cancelled) setupDragAndDrop();
      })
      .catch((error) => console.error('Error loading external scripts:', error));

    // Cleanup function to remove event listeners
    return () => {
      cancelled = true;
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  const doError = (message: string) => {
    const alertArea = document.getElementById('alertArea');
    if (!alertArea) return;
    alertArea.replaceChildren();

    const alert = document.createElement('div');
    alert.className = 'alert alert-block alert-error';
    alert.setAttribute('role', 'alert');

    const closeButton = document.createElement('button');
    closeButton.className = 'close';
    closeButton.textContent = '×';
    closeButton.onclick = () => alert.remove();

    const text = document.createElement('p');
    text.textContent = message;

    alert.append(closeButton, text);
    alertArea.append(alert);
  };

  // shortcut: tope arbitrario para evitar que el navegador se cuelgue
  // decodificando un archivo gigante en el hilo principal; subir si algún
  // formato legítimo lo necesita.
  const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;

  const handleFile = (file: File) => {
    console.log('try to parse ' + file.name);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      doError(`El archivo es demasiado grande (máximo ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB).`);
      return;
    }

    // Extraer nombre del archivo sin extensión
    const fileName = file.name.replace(/\.(cbr|cbz|zip|rar|pdf)$/i, '');
    setComicName(fileName);
    comicKeyRef.current = getComicKey(file);

    setImages([]);
    setCurrentPanel(0);
    setShowButtons(false);
    setIsLoading(true);
    setLoadingProgress(0);

    if (/\.pdf$/i.test(file.name)) {
      // pdfjs-dist es pesado (~1.3MB con su worker); se carga solo cuando
      // se abre un PDF, no en el bundle principal.
      import('./pdfProcessor')
        .then(({ processPdfFile }) => processPdfFile(file, setLoadingProgress))
        .then((newImages) => {
          setImages(newImages);
          setCurrentPanel(getSavedPage(comicKeyRef.current!, newImages.length));
          setIsLoading(false);
          setShowButtons(true);
        })
        .catch((err: Error) => {
          console.error(err);
          doError(err.message);
          setIsLoading(false);
        });
      return;
    }

    if (window.archiveOpenFile) {
      window.archiveOpenFile(file, null, (archive: Archive | null, err: unknown) => {
        if (archive) {
          console.info('Uncompressing ' + archive.archive_type + ' ...');

          // Orden alfabético por nombre: las entradas pueden descomprimirse en
          // cualquier orden (el tiempo de descompresión varía por entrada), así
          // que cada resultado se escribe en su índice fijo, no con push().
          const imageArchive = archive.entries
            .filter((e) => e.is_file)
            .sort((a, b) => a.name.localeCompare(b.name));
          const newImages: string[] = new Array(imageArchive.length);
          let processedCount = 0;

          imageArchive.forEach((entry, index) => {
            entry.readData((data) => {
              if (data) {
                const url = URL.createObjectURL(new Blob([data]));
                newImages[index] = url;
                processedCount++;

                const progress = Math.floor((processedCount / imageArchive.length) * 100);
                setLoadingProgress(progress);

                if (processedCount === imageArchive.length) {
                  setImages(newImages);
                  setCurrentPanel(getSavedPage(comicKeyRef.current!, newImages.length));
                  setIsLoading(false);
                  setShowButtons(true);
                }
              }
            });
          });
        } else {
          console.error(err);
          doError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        }
      });
    } else {
      doError('No se pudo cargar el lector de archivos comprimidos. Recargá la página e intentá de nuevo.');
      setIsLoading(false);
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const closeComic = () => {
    setImages([]);
    setCurrentPanel(0);
    setShowButtons(false);
    setComicName("");
    setIsLoading(false);
    setLoadingProgress(0);
  };

  const prevPanel = () => {
    if (currentPanel > 0) {
      window.scrollTo({ top: window.innerHeight * 0.3, behavior: 'smooth' });
      setCurrentPanel(currentPanel - 1);
    }
  };

  const nextPanel = () => {
    if (currentPanel + 1 < images.length) {
      window.scrollTo({ top: window.innerHeight * 0.3, behavior: 'smooth' });
      setCurrentPanel(currentPanel + 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < images.length) {
      window.scrollTo({ top: window.innerHeight * 0.3, behavior: 'smooth' });
      setCurrentPanel(page);
    }
  };

  return {
    // State
    images,
    currentPanel,
    comicName,
    isLoading,
    loadingProgress,
    showButtons,
    fileInputRef,
    
    // Actions
    handleFile,
    handleFilesChange,
    triggerFileInput,
    closeComic,
    prevPanel,
    nextPanel,
    goToPage
  };
};
