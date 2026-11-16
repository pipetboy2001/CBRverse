import { useState, useEffect } from 'react';

export const useViewMode = () => {
  const [cascadeMode, setCascadeMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);

  // Detectar cambios en el modo pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleCascadeMode = () => {
    setCascadeMode((prev) => !prev);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Entrar en pantalla completa
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error al intentar entrar en pantalla completa:', err);
      });
    } else {
      // Salir de pantalla completa
      document.exitFullscreen().catch(err => {
        console.error('Error al intentar salir de pantalla completa:', err);
      });
    }
  };

  const scrollToPage = (pageIndex: number) => {
    const pageElement = document.querySelector(`.cascade-page:nth-child(${pageIndex + 1})`);
    if (pageElement) {
      pageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  const rotateClockwise = () => {
    setRotation((prev) => ((prev + 90) % 360) as 0 | 90 | 180 | 270);
  };

  return {
    cascadeMode,
    isFullscreen,
    rotation,
    toggleCascadeMode,
    toggleFullscreen,
    scrollToPage,
    rotateClockwise
  };
};
