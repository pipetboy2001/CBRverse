import { useState, useEffect } from 'react';
import $ from 'jquery';

export const useViewMode = () => {
  const [cascadeMode, setCascadeMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Detectar cambios en el modo pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleCascadeMode = () => {
    const newCascadeMode = !cascadeMode;
    setCascadeMode(newCascadeMode);
    
    // Si estamos volviendo al modo página, asegurar que la imagen se muestre
    if (!newCascadeMode) {
      setTimeout(() => {
        const currentSrc = $("#comicImg").attr("src");
        if (currentSrc) {
          $("#comicImg").attr("src", currentSrc);
        }
      }, 100);
    }
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

  return {
    cascadeMode,
    isFullscreen,
    toggleCascadeMode,
    toggleFullscreen,
    scrollToPage
  };
};
