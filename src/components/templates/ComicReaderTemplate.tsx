import React from 'react';
import { Header, ComicViewer, Footer } from '../organisms';
import { LoadingModal, InfoAlert } from '../molecules';
import { ConfigOption } from '../../types';

interface ComicReaderTemplateProps {
  // Comic state
  images: string[];
  currentPanel: number;
  comicName: string;
  isLoading: boolean;
  loadingProgress: number;
  showButtons: boolean;
  
  // View mode
  cascadeMode: boolean;
  rotation: 0 | 90 | 180 | 270;

  // UI state
  showConfigMenu: boolean;

  // Config options
  configOptions: ConfigOption[];

  // Event handlers
  onToggleConfigMenu: () => void;
  onCloseConfigMenu: () => void;
  onCloseComic: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRotate: () => void;
}

export const ComicReaderTemplate: React.FC<ComicReaderTemplateProps> = ({
  images,
  currentPanel,
  comicName,
  isLoading,
  loadingProgress,
  showButtons,
  cascadeMode,
  rotation,
  showConfigMenu,
  configOptions,
  onToggleConfigMenu,
  onCloseConfigMenu,
  onCloseComic,
  onPrevious,
  onNext,
  onRotate
}) => {
  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Header */}
      <Header
        comicName={comicName}
        currentPanel={currentPanel}
        totalPanels={images.length}
        cascadeMode={cascadeMode}
        showConfigMenu={showConfigMenu}
        onToggleConfigMenu={onToggleConfigMenu}
        onCloseConfigMenu={onCloseConfigMenu}
        onCloseComic={onCloseComic}
        configOptions={configOptions}
        onRotate={onRotate}
      />

      {/* Contenido principal */}
      <div className={`pt-20 ${cascadeMode ? '' : 'pb-footer'}`}>
        <div className="glass-container container mx-auto" style={{ maxWidth: '1200px' }}>
          {/* Alertas informativas */}
          {showButtons && (
            <InfoAlert cascadeMode={cascadeMode} />
          )}

          <output id="list"></output>
          <div id="alertArea"></div>

          {/* Loading Modal */}
          <LoadingModal
            isVisible={isLoading}
            progress={loadingProgress}
          />

          {/* Comic Viewer */}
          <ComicViewer
            images={images}
            currentPanel={currentPanel}
            cascadeMode={cascadeMode}
            rotation={rotation}
          />
        </div>
      </div>

      {/* Footer */}
      <Footer 
        currentPanel={currentPanel}
        totalPanels={images.length}
        onPrevious={onPrevious}
        onNext={onNext}
        cascadeMode={cascadeMode}
        showButtons={showButtons}
      />
    </div>
  );
};
