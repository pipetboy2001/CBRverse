import React from 'react';

interface NavbarTitleProps {
  comicName: string;
  currentPanel: number;
  totalPanels: number;
  cascadeMode: boolean;
}

export const NavbarTitle: React.FC<NavbarTitleProps> = ({
  comicName,
  currentPanel,
  totalPanels,
  cascadeMode
}) => {
  return (
    <div className="navbar-title">
      <span className="title-text">
        {comicName || "CBRVerse"}
      </span>
      {comicName && (
        <span className="page-info">
          {cascadeMode 
            ? `Modo Cascada - ${totalPanels} páginas`
            : `Página ${currentPanel + 1} de ${totalPanels}`
          }
        </span>
      )}
    </div>
  );
};
