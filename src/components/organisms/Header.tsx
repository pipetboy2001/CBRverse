import React from 'react';
import { Button, Icon } from '../atoms';
import { ConfigMenu, NavbarTitle } from '../molecules';
import { ConfigOption } from '../../types';
import { ZOOM_MIN, ZOOM_MAX } from '../../hooks/useViewMode';

interface HeaderProps {
  comicName: string;
  currentPanel: number;
  totalPanels: number;
  cascadeMode: boolean;
  zoomLevel: number;
  showConfigMenu: boolean;
  onToggleConfigMenu: () => void;
  onCloseConfigMenu: () => void;
  onCloseComic: () => void;
  configOptions: ConfigOption[];
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  comicName,
  currentPanel,
  totalPanels,
  cascadeMode,
  zoomLevel,
  showConfigMenu,
  onToggleConfigMenu,
  onCloseConfigMenu,
  onCloseComic,
  configOptions,
  onZoomIn,
  onZoomOut
}) => {
  return (
    <nav className="navbar fixed-top navbar-custom">
      <div className="container-fluid">
        <div className="navbar-content">
          {/* Botón cerrar (X) */}
          <Button
            variant="navbar"
            onClick={onCloseComic}
            title="Cerrar cómic y seleccionar otro"
            className="navbar-close-btn"
          >
            <Icon name="x-lg" />
          </Button>

          {/* Nombre del cómic */}
          <NavbarTitle
            comicName={comicName}
            currentPanel={currentPanel}
            totalPanels={totalPanels}
            cascadeMode={cascadeMode}
          />

          {/* Controles de zoom */}
          <div className="navbar-zoom-controls">
            <Button
              variant="navbar"
              onClick={onZoomOut}
              disabled={zoomLevel <= ZOOM_MIN}
              title="Alejar"
              aria-label="Alejar"
            >
              <Icon name="zoom-out" />
            </Button>
            <span className="navbar-zoom-level">{zoomLevel}%</span>
            <Button
              variant="navbar"
              onClick={onZoomIn}
              disabled={zoomLevel >= ZOOM_MAX}
              title="Acercar"
              aria-label="Acercar"
            >
              <Icon name="zoom-in" />
            </Button>
          </div>

          {/* Botón de configuración con menú desplegable */}
          <ConfigMenu
            isOpen={showConfigMenu}
            onToggle={onToggleConfigMenu}
            onClose={onCloseConfigMenu}
            options={configOptions}
          />
        </div>
      </div>
    </nav>
  );
};
