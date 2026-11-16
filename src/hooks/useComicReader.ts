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
  const [passwordRequired, setPasswordRequired] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);
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

  // Antes insertaba el alert a mano en el DOM (#alertArea), pero esa pantalla
  // puede desmontarse/remontarse como parte del mismo cambio de estado que
  // dispara el error (ej. isLoading pasa a false y se vuelve a la pantalla de
  // bienvenida), asi que el nodo donde se insertaba podia ya no existir mas,
  // ni con un setTimeout(0) de por medio (la carrera con el commit de React
  // no es determinista). Ahora es estado de React: cada pantalla que lo
  // necesite lo renderiza ella misma via errorMessage/clearError.
  const doError = (message: string) => {
    setErrorMessage(message);
  };

  const clearError = () => {
    setErrorMessage(null);
  };

  // shortcut: tope arbitrario para evitar que el navegador se cuelgue
  // decodificando un archivo gigante en el hilo principal; subir si algún
  // formato legítimo lo necesita.
  const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;

  const handleFile = (file: File, password: string | null = null) => {
    console.log('try to parse ' + file.name);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      doError(`El archivo es demasiado grande (máximo ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB).`);
      return;
    }

    pendingFileRef.current = file;

    // Extraer nombre del archivo sin extensión
    const fileName = file.name.replace(/\.(cbr|cbz|zip|rar|pdf)$/i, '');
    setComicName(fileName);
    comicKeyRef.current = getComicKey(file);

    setImages([]);
    setCurrentPanel(0);
    setShowButtons(false);
    setPasswordRequired(false);
    setPasswordError(null);
    setErrorMessage(null);
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
      window.archiveOpenFile(file, password, (archive: Archive | null, err: unknown) => {
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
          let aborted = false;

          imageArchive.forEach((entry, index) => {
            entry.readData((data, entryErr) => {
              if (aborted) return;

              if (!data) {
                // Entrada no legible: si es por contraseña (algunos RAR cifran
                // el contenido pero no los nombres, asi que esto recien se
                // detecta aca y no al abrir el archivo), pedirla y frenar;
                // antes este caso quedaba colgado para siempre sin feedback.
                const message = entryErr instanceof Error ? entryErr.message : String(entryErr);
                if (/password/i.test(message)) {
                  aborted = true;
                  setPasswordRequired(true);
                  setPasswordError(password ? 'Contraseña incorrecta, probá de nuevo.' : null);
                  setIsLoading(false);
                }
                return;
              }

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
            });
          });
        } else {
          const message = err instanceof Error ? err.message : String(err);

          if (/password/i.test(message)) {
            setPasswordRequired(true);
            setPasswordError(password ? 'Contraseña incorrecta, probá de nuevo.' : null);
            setIsLoading(false);
            return;
          }

          if (/encrypted/i.test(message)) {
            doError('Este archivo está protegido con un método de cifrado que todavía no soportamos (CBZ/ZIP cifrado). Probá con la contraseña solo si es un CBR/RAR.');
            setIsLoading(false);
            return;
          }

          console.error(err);
          doError(message);
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
    pendingFileRef.current = null;
    setImages([]);
    setCurrentPanel(0);
    setShowButtons(false);
    setComicName("");
    setIsLoading(false);
    setLoadingProgress(0);
    setPasswordRequired(false);
    setPasswordError(null);
    setErrorMessage(null);
  };

  const submitPassword = (password: string) => {
    if (!pendingFileRef.current) return;
    handleFile(pendingFileRef.current, password);
  };

  const cancelPassword = () => {
    pendingFileRef.current = null;
    setPasswordRequired(false);
    setPasswordError(null);
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
    passwordRequired,
    passwordError,
    errorMessage,
    fileInputRef,

    // Actions
    handleFile,
    handleFilesChange,
    triggerFileInput,
    closeComic,
    prevPanel,
    nextPanel,
    goToPage,
    submitPassword,
    cancelPassword,
    clearError
  };
};
