import React from 'react';
import { Icon } from '../atoms';

interface InfoAlertProps {
  cascadeMode: boolean;
  className?: string;
}

export const InfoAlert: React.FC<InfoAlertProps> = ({
  cascadeMode,
  className = ''
}) => {
  return (
    <div className={`alert alert-info d-flex align-items-center justify-content-center text-center ${className}`} style={{
      background: 'var(--color-surface-btn)',
      color: 'var(--color-text-secondary)',
      borderRadius: '10px',
      padding: '15px',
      margin: '10px 0',
      fontSize: '14px',
      border: '1px solid var(--color-border)'
    }}>
      <Icon name={cascadeMode ? "layers" : "keyboard"} className="me-2" />
      <strong>
        {cascadeMode ? "Modo Cascada:" : "Atajos:"}
      </strong>
      {cascadeMode 
        ? " Todas las páginas se muestran en secuencia. Usa ← → para navegar."
        : " ← → (flechas) | A D (teclas)"
      }
    </div>
  );
};
