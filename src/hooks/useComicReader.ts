import { useState, useEffect, useRef } from 'react';
import { processPdfFile } from './pdfProcessor';
import type { Archive } from '../types';

export const useComicReader = () => {
  const [images, setImages] = useState<string[]>([]);
  const [currentPanel, setCurrentPanel] = useState<number>(0);
  const [comicName, setComicName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [showButtons, setShowButtons] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Libera las blob URLs de las páginas cada vez que se reemplazan (nuevo cómic, cierre, o unmount)
  useEffect(() => {
    return () => {
      images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  // Initialize external scripts
  useEffect(() => {
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

    const loadExternalScripts = async () => {
      try {
        // Check if scripts are already loaded to avoid duplicates
        if (window.JSZip && window.loadArchiveFormats) {
          setupDragAndDrop();
          return;
        }

        if (!window.JSZip) {
          await new Promise((resolve, reject) => {
            // Check if script already exists
            const existingScript = document.querySelector('script[src="/lib/jszip.js"]');
            if (existingScript) {
              resolve(undefined);
              return;
            }

            const script = document.createElement('script');
            script.src = '/lib/jszip.js';
            script.onload = () => resolve(undefined);
            script.onerror = () => reject(new Error('Failed to load jszip.js'));
            document.head.appendChild(script);
          });
        }

        if (!window.loadArchiveFormats) {
          await new Promise((resolve, reject) => {
            // Check if script already exists
            const existingScript = document.querySelector('script[src="/lib/uncompress.js"]');
            if (existingScript) {
              resolve(undefined);
              return;
            }

            const script = document.createElement('script');
            script.src = '/lib/uncompress.js';
            script.onload = () => resolve(undefined);
            script.onerror = () => reject(new Error('Failed to load uncompress.js'));
            document.head.appendChild(script);
          });
        }

        if (window.loadArchiveFormats) {
          window.loadArchiveFormats(['rar', 'zip'], () => {
            console.log('Archive formats loaded');
            setupDragAndDrop();
          });
        }
      } catch (error) {
        console.error('Error loading external scripts:', error);
      }
    };

    loadExternalScripts();

    // Cleanup function to remove event listeners
    return () => {
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

    const closeButton = document.createElement('button');
    closeButton.className = 'close';
    closeButton.textContent = '×';
    closeButton.onclick = () => alert.remove();

    const text = document.createElement('p');
    text.textContent = message;

    alert.append(closeButton, text);
    alertArea.append(alert);
  };

  const handleFile = (file: File) => {
    console.log('try to parse ' + file.name);

    // Extraer nombre del archivo sin extensión
    const fileName = file.name.replace(/\.(cbr|cbz|zip|rar|pdf)$/i, '');
    setComicName(fileName);

    setImages([]);
    setCurrentPanel(0);
    setShowButtons(false);
    setIsLoading(true);
    setLoadingProgress(0);

    if (/\.pdf$/i.test(file.name)) {
      processPdfFile(file, setLoadingProgress)
        .then((newImages) => {
          setImages(newImages);
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

          const imageArchive = archive.entries.filter((e) => e.is_file);
          const newImages: string[] = [];
          let processedCount = 0;

          imageArchive.forEach((entry) => {
            entry.readData((data) => {
              if (data) {
                const url = URL.createObjectURL(new Blob([data]));
                newImages.push(url);
                processedCount++;

                const progress = Math.floor((processedCount / imageArchive.length) * 100);
                setLoadingProgress(progress);

                if (processedCount === imageArchive.length) {
                  setImages(newImages);
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
