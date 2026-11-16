import React from 'react';
import { Button, Icon } from '../atoms';
import { ConfigMenu, NavbarTitle } from '../molecules';
import { ConfigOption } from '../../types';

interface HeaderProps {
  comicName: string;
  currentPanel: number;
  totalPanels: number;
  cascadeMode: boolean;
  showConfigMenu: boolean;
  onToggleConfigMenu: () => void;
  onCloseConfigMenu: () => void;
  onCloseComic: () => void;
  configOptions: ConfigOption[];
  onRotate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  comicName,
  currentPanel,
  totalPanels,
  cascadeMode,
  showConfigMenu,
  onToggleConfigMenu,
  onCloseConfigMenu,
  onCloseComic,
  configOptions,
  onRotate
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

          {/* Rotar página */}
          <Button
            variant="navbar"
            onClick={onRotate}
            title="Rotar página 90°"
            aria-label="Rotar página 90°"
          >
            <Icon name="arrow-clockwise" />
          </Button>

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
