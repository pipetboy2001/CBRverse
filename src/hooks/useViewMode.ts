import { useState, useEffect } from 'react';

export const ZOOM_MIN = 50;
export const ZOOM_MAX = 250;
const ZOOM_STEP = 10;
const ZOOM_DEFAULT = 100;

export const useViewMode = () => {
  const [cascadeMode, setCascadeMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(ZOOM_DEFAULT);

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

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(ZOOM_MAX, prev + ZOOM_STEP));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(ZOOM_MIN, prev - ZOOM_STEP));
  };

  const resetZoom = () => {
    setZoomLevel(ZOOM_DEFAULT);
  };

  return {
    cascadeMode,
    isFullscreen,
    zoomLevel,
    toggleCascadeMode,
    toggleFullscreen,
    scrollToPage,
    zoomIn,
    zoomOut,
    resetZoom
  };
};
