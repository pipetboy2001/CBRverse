import { useState, useEffect } from 'react';

export const useUIState = () => {
  const [showConfigMenu, setShowConfigMenu] = useState<boolean>(false);

  // Cerrar menú de configuración al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showConfigMenu && !target.closest('.config-menu-container')) {
        setShowConfigMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showConfigMenu]);

  const toggleConfigMenu = () => {
    setShowConfigMenu(prev => !prev);
  };

  const closeConfigMenu = () => {
    setShowConfigMenu(false);
  };

  return {
    showConfigMenu,
    toggleConfigMenu,
    closeConfigMenu
  };
};
