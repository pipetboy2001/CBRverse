import React from 'react';
import { Icon, ProgressBar } from '../atoms';

interface LoadingModalProps {
  isVisible: boolean;
  progress: number;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isVisible,
  progress
}) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="mb-4">
          <h3 className="text-shadow-lg" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0' }}>
            <Icon name="gear-fill" className="me-2" style={{ animation: 'spin 1s linear infinite' }} />
            Procesando Archivo
          </h3>
        </div>
        <p className="text-shadow-sm" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
          Extrayendo y procesando imágenes...
        </p>
        <ProgressBar progress={progress} />
        <small className="opacity-90">
          <Icon name="clock" className="me-1" />
          {progress}% completado
        </small>
      </div>
    </div>
  );
};
