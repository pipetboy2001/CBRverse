import React from 'react';
import { WelcomeScreen } from '../components/organisms';
import { ComicReaderTemplate } from '../components/templates';
import { useComicReader } from '../hooks/useComicReader';
import { useViewMode } from '../hooks/useViewMode';
import { useUIState } from '../hooks/useUIState';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { ConfigOption } from '../types';

export const ComicReaderPage: React.FC = () => {
  // Hooks
  const {
    images,
    currentPanel,
    comicName,
    fileType,
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
    toggleCascadeMode,
    toggleFullscreen,
    scrollToPage
  } = useViewMode();

  const {
    showConfigMenu,
    toggleConfigMenu,
    closeConfigMenu
  } = useUIState();

  // Navegación por teclado
  useKeyboardNavigation(
    images,
    currentPanel,
    cascadeMode,
    prevPanel,
    nextPanel,
    goToPage,
    scrollToPage
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
      id: 'themes',
      icon: 'palette',
      title: 'Temas',
      description: 'Cambiar tema de la aplicación',
      status: 'Próximamente',
      disabled: true,
      action: () => {}
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
      fileType={fileType}
      isLoading={isLoading}
      loadingProgress={loadingProgress}
      showButtons={showButtons}
      cascadeMode={cascadeMode}
      showConfigMenu={showConfigMenu}
      configOptions={configOptions}
      onToggleConfigMenu={toggleConfigMenu}
      onCloseConfigMenu={closeConfigMenu}
      onCloseComic={closeComic}
      onPrevious={prevPanel}
      onNext={nextPanel}
    />
  );
};
