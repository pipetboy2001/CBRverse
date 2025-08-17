import React from 'react';
import { NavigationControls } from '../molecules';

interface FooterProps {
  currentPanel: number;
  totalPanels: number;
  onPrevious: () => void;
  onNext: () => void;
  cascadeMode: boolean;
  showButtons: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  currentPanel,
  totalPanels,
  onPrevious,
  onNext,
  cascadeMode,
  showButtons
}) => {
  if (!showButtons || cascadeMode) return null;

  return (
    <footer className="footer-fixed">
      <div className="footer-content">
        <NavigationControls 
          currentPanel={currentPanel}
          totalPanels={totalPanels}
          onPrevious={onPrevious}
          onNext={onNext}
          cascadeMode={cascadeMode}
        />
      </div>
    </footer>
  );
};
