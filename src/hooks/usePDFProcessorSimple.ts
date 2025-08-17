import { useState } from 'react';

export const usePDFProcessorSimple = () => {
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);

  const processPDFFile = async (
    file: File,
    _onProgress: (progress: number) => void,
    _onComplete: (images: string[]) => void,
    onError: (error: string) => void
  ) => {
    setIsProcessingPDF(true);
    
    try {
      console.log('Starting simple PDF processing for:', file.name);
      
      // Por ahora, mostrar un error explicativo
      onError('La funcionalidad PDF está en desarrollo. El archivo se detectó correctamente como PDF, pero el procesamiento aún no está disponible. Por favor, usa archivos CBR, CBZ, ZIP o RAR por ahora.');
      
    } catch (error) {
      console.error('Error in simple PDF processor:', error);
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
