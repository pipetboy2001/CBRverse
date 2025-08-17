import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export const usePDFProcessor = () => {
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);

  const processPDFFile = async (
    file: File,
    onProgress: (progress: number) => void,
    onComplete: (images: string[]) => void,
    onError: (error: string) => void
  ) => {
    setIsProcessingPDF(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 1,
        enableXfa: false,
        fontExtraProperties: false
      });
      
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      const images: string[] = [];
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error('No se pudo crear el contexto del canvas');
          }
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
          };
          
          await page.render(renderContext).promise;
          
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error(`Failed to create blob for page ${pageNum}`));
              }
            }, 'image/png', 0.8);
          });
          
          const imageUrl = URL.createObjectURL(blob);
          images.push(imageUrl);
          
          const progress = Math.floor((pageNum / totalPages) * 100);
          onProgress(progress);
          
        } catch (pageError) {
          console.error(`Error processing page ${pageNum}:`, pageError);
          onError(`Error en página ${pageNum}: ${pageError instanceof Error ? pageError.message : 'Error desconocido'}`);
        }
      }
      
      if (images.length === 0) {
        throw new Error('No se pudieron procesar las páginas del PDF');
      }
      
      onComplete(images);
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      onError(error instanceof Error ? error.message : 'Error desconocido al procesar PDF');
    } finally {
      setIsProcessingPDF(false);
    }
  };

  return {
    processPDFFile,
    isProcessingPDF
  };
};
