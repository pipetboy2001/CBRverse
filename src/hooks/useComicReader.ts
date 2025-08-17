import { useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import { usePDFProcessor } from './usePDFProcessor';
import { FileType } from '../types';

export const useComicReader = () => {
  const [images, setImages] = useState<string[]>([]);
  const [currentPanel, setCurrentPanel] = useState<number>(0);
  const [comicName, setComicName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [showButtons, setShowButtons] = useState<boolean>(false);
  const [fileType, setFileType] = useState<FileType | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { processPDFFile } = usePDFProcessor();

  useEffect(() => {
    const loadExternalScripts = async () => {
      try {
        if (window.JSZip && window.loadArchiveFormats) {
          setupDragAndDrop();
          return;
        }

        if (!window.JSZip) {
          await new Promise((resolve, reject) => {
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
    const fileExtension = file.name.split('.').pop()?.toLowerCase() as FileType;
    const fileName = file.name.replace(/\.(cbr|cbz|zip|rar|pdf)$/i, '');
    
    setComicName(fileName);
    setFileType(fileExtension);
    setImages([]);
    setCurrentPanel(0);
    setShowButtons(false);
    setIsLoading(true);
    setLoadingProgress(0);

    $("#comicImg").attr("src", "");

    if (fileExtension === 'pdf') {
      processPDFFile(
        file,
        (progress) => {
          setLoadingProgress(progress);
        },
        (images) => {
          setImages(images);
          setIsLoading(false);
          setShowButtons(true);
          drawPanel(0, images);
        },
        (error) => {
          console.error('PDF processing error:', error);
          doError(`Error al procesar PDF: ${error}`);
          setIsLoading(false);
        }
      );
      return;
    }

    if (window.archiveOpenFile) {
      window.archiveOpenFile(file, null, (archive: any, err: any) => {
        if (archive) {
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
    setFileType(undefined);
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
    images,
    currentPanel,
    comicName,
    fileType,
    isLoading,
    loadingProgress,
    showButtons,
    fileInputRef,
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
