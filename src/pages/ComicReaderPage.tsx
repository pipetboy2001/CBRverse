import React from 'react';
import { WelcomeScreen } from '../components/organisms';
import { ComicReaderTemplate } from '../components/templates';
import { useComicReader } from '../hooks/useComicReader';
import { useViewMode } from '../hooks/useViewMode';
import { useUIState } from '../hooks/useUIState';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useTheme } from '../hooks/useTheme';
import { ConfigOption } from '../types';

export const ComicReaderPage: React.FC = () => {
  // Hooks
  const {
    images,
    currentPanel,
    comicName,
    isLoading,
    loadingProgress,
    showButtons,
    fileInputRef,
    handleFilesChange,
    triggerFileInput,
    closeComic,
    prevPanel,
    nextPanel,
    goToPage
  } = useComicReader();

  const {
    cascadeMode,
    isFullscreen,
    zoomLevel,
    readingDirection,
    rotation,
    toggleCascadeMode,
    toggleFullscreen,
    scrollToPage,
    zoomIn,
    zoomOut,
    toggleReadingDirection,
    rotateClockwise
  } = useViewMode();

  const {
    showConfigMenu,
    toggleConfigMenu,
    closeConfigMenu
  } = useUIState();

  const { theme, toggleTheme } = useTheme();

  // Navegación por teclado
  useKeyboardNavigation(
    images,
    currentPanel,
    cascadeMode,
    prevPanel,
    nextPanel,
    goToPage,
    scrollToPage,
    readingDirection
  );

  // Configurar opciones del menú
  const configOptions: ConfigOption[] = [
    {
      id: 'cascade-mode',
      icon: cascadeMode ? 'file-earmark-text' : 'layers',
      title: cascadeMode ? 'Modo Página' : 'Modo Cascada',
      description: cascadeMode 
        ? 'Ver una página a la vez' 
        : 'Ver todas las páginas en secuencia',
      status: 'Activar',
      action: () => {
        toggleCascadeMode();
        closeConfigMenu();
      }
    },
    {
      id: 'fullscreen',
      icon: isFullscreen ? 'fullscreen-exit' : 'arrows-fullscreen',
      title: isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa',
      description: isFullscreen 
        ? 'Volver al modo ventana normal' 
        : 'Expandir a pantalla completa',
      status: isFullscreen ? 'Salir' : 'Activar',
      action: () => {
        toggleFullscreen();
        closeConfigMenu();
      }
    },
    {
      id: 'reading-direction',
      icon: readingDirection === 'manga' ? 'arrow-left-circle' : 'arrow-right-circle',
      title: readingDirection === 'manga' ? 'Modo Manga' : 'Modo Comic',
      description: readingDirection === 'manga'
        ? 'Tocar la izquierda avanza (lectura derecha a izquierda)'
        : 'Tocar la derecha avanza (lectura izquierda a derecha)',
      status: 'Cambiar',
      action: () => {
        toggleReadingDirection();
        closeConfigMenu();
      }
    },
    {
      id: 'theme',
      icon: theme === 'dark' ? 'sun' : 'moon-stars',
      title: theme === 'dark' ? 'Tema Claro' : 'Tema Oscuro',
      description: theme === 'dark'
        ? 'Cambiar a un fondo claro'
        : 'Volver al fondo oscuro',
      status: 'Cambiar',
      action: () => {
        toggleTheme();
        closeConfigMenu();
      }
    }
  ];

  // Pantalla de bienvenida cuando no hay cómics cargados
  if (!showButtons && !isLoading) {
    return (
      <WelcomeScreen 
        fileInputRef={fileInputRef}
        onFilesChange={handleFilesChange}
        onTriggerFileInput={triggerFileInput}
      />
    );
  }

  // Template principal del lector
  return (
    <ComicReaderTemplate 
      images={images}
      currentPanel={currentPanel}
      comicName={comicName}
      isLoading={isLoading}
      loadingProgress={loadingProgress}
      showButtons={showButtons}
      cascadeMode={cascadeMode}
      zoomLevel={zoomLevel}
      readingDirection={readingDirection}
      rotation={rotation}
      showConfigMenu={showConfigMenu}
      configOptions={configOptions}
      onToggleConfigMenu={toggleConfigMenu}
      onCloseConfigMenu={closeConfigMenu}
      onCloseComic={closeComic}
      onPrevious={prevPanel}
      onNext={nextPanel}
      onZoomIn={zoomIn}
      onZoomOut={zoomOut}
      onRotate={rotateClockwise}
    />
  );
};
