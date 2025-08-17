import React from 'react';
import { Button, Icon } from '../atoms';

interface NavigationControlsProps {
  currentPanel: number;
  totalPanels: number;
  onPrevious: () => void;
  onNext: () => void;
  cascadeMode?: boolean;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentPanel,
  totalPanels,
  onPrevious,
  onNext,
  cascadeMode = false
}) => {
  if (cascadeMode) {
    return null; // No mostrar controles en modo cascada
  }

  return (
    <div className="footer-controls">
      <Button 
        variant="footer"
        onClick={onPrevious}
        disabled={currentPanel === 0}
      >
        <Icon name="arrow-left" className="me-1" /> Anterior
      </Button>
      
      <div className="footer-page-counter">
        <Icon name="file-earmark-text" className="me-1" />
        Página {currentPanel + 1} de {totalPanels}
      </div>
      
      <Button 
        variant="footer"
        onClick={onNext}
        disabled={currentPanel >= totalPanels - 1}
      >
        Siguiente <Icon name="arrow-right" className="ms-1" />
      </Button>
    </div>
  );
};
