import React from 'react';
import { Icon } from '../atoms';

interface InfoAlertProps {
  cascadeMode: boolean;
  fileType?: string;
  className?: string;
}

export const InfoAlert: React.FC<InfoAlertProps> = ({
  cascadeMode,
  fileType,
  className = ''
}) => {
  const getFileTypeIcon = () => {
    if (fileType === 'pdf') return 'file-earmark-pdf';
    return 'archive';
  };

  const getFileTypeText = () => {
    if (fileType === 'pdf') return 'PDF';
    return 'Archivo';
  };

  return (
    <div className={`alert alert-info d-flex align-items-center justify-content-center text-center ${className}`} style={{
      background: 'rgba(60, 60, 60, 0.6)',
      borderColor: 'rgba(100, 100, 100, 0.3)',
      color: '#c0c0c0',
      borderRadius: '10px',
      padding: '15px',
      margin: '10px 0',
      fontSize: '14px',
      border: '1px solid rgba(100, 100, 100, 0.3)'
    }}>
      <Icon name={getFileTypeIcon()} className="me-2" />
      <strong>
        {getFileTypeText()} - {cascadeMode ? "Modo Cascada:" : "Atajos:"}
      </strong>
      {cascadeMode 
        ? " Todas las páginas se muestran en secuencia. Usa ← → para navegar."
        : " ← → (flechas) | A D (teclas)"
      }
    </div>
  );
};
