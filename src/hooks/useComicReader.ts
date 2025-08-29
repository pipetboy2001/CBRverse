import { useState, useEffect, useRef } from 'react';
import $ from 'jquery';

export const useComicReader = () => {
  const [images, setImages] = useState<string[]>([]);
  const [currentPanel, setCurrentPanel] = useState<number>(0);
  const [comicName, setComicName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [showButtons, setShowButtons] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize external scripts
  useEffect(() => {
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
      const $document = $(document);
      $document.off("dragover.cbrverse drop.cbrverse");
    };
  }, []);

  const setupDragAndDrop = () => {
    const $document = $(document);
    
    // Remove any existing handlers first
    $document.off("dragover.cbrverse drop.cbrverse");
    
    $document.on("dragover.cbrverse", (e) => {
      e.preventDefault();
      const dragEvent = e.originalEvent as DragEvent;
      if (dragEvent && dragEvent.dataTransfer) {
        dragEvent.dataTransfer.dropEffect = "move";
      }
    });

    $document.on("drop.cbrverse", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const dragEvent = e.originalEvent as DragEvent;
      if (!dragEvent?.dataTransfer?.files) return;
      const files = dragEvent.dataTransfer.files;
      
      if (files.length === 0) return;
      if (files.length > 1) {
        doError("You may only drop one file.");
        return;
      }
      
      handleFile(files[0]);
    });
  };

  const doError = (message: string) => {
    const errorHtml = `
      <div class='alert alert-block alert-error'>
        <button class="close" data-dismiss="alert">&times;</button>
        <p>${message}</p>
      </div>
    `;
    $("#alertArea").html(errorHtml);
  };

  const handleFile = (file: File) => {
    console.log('try to parse ' + file.name);

    // Extraer nombre del archivo sin extensión
    const fileName = file.name.replace(/\.(cbr|cbz|zip|rar)$/i, '');
    setComicName(fileName);

    setImages([]);
    setCurrentPanel(0);
    setShowButtons(false);
    setIsLoading(true);
    setLoadingProgress(0);

    $("#comicImg").attr("src", "");

    if (window.archiveOpenFile) {
      window.archiveOpenFile(file, null, (archive: any, err: any) => {
        if (archive) {
          console.info('Uncompressing ' + archive.archive_type + ' ...');
          
          const imageArchive = archive.entries.filter((e: any) => e.is_file);
          const newImages: string[] = [];
          let processedCount = 0;

          imageArchive.forEach((entry: any) => {
            entry.readData((data: ArrayBuffer, _error: any) => {
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
                  drawPanel(0, newImages);
                }
              }
            });
          });
        } else {
          console.error(err);
          doError(err);
          setIsLoading(false);
        }
      });
    }
  };

  const drawPanel = (num: number, imageArray: string[] = images) => {
    setCurrentPanel(num);
    $("#comicImg").attr("src", imageArray[num]);
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
    $("#comicImg").attr("src", "");
  };

  const prevPanel = () => {
    if (currentPanel > 0) {
      $('html, body').animate({ scrollTop: window.innerHeight * 0.3 }, 400);
      const newPanel = currentPanel - 1;
      setCurrentPanel(newPanel);
      drawPanel(newPanel);
    }
  };

  const nextPanel = () => {
    if (currentPanel + 1 < images.length) {
      $('html, body').animate({ scrollTop: window.innerHeight * 0.3 }, 400);
      const newPanel = currentPanel + 1;
      setCurrentPanel(newPanel);
      drawPanel(newPanel);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < images.length) {
      $('html, body').animate({ scrollTop: window.innerHeight * 0.3 }, 400);
      setCurrentPanel(page);
      drawPanel(page);
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
    goToPage,
    drawPanel
  };
};
