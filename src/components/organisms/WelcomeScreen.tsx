import React from 'react';
import { Button, FileInput } from '../atoms';
import { ErrorAlert } from '../molecules';

interface WelcomeScreenProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTriggerFileInput: () => void;
  errorMessage: string | null;
  onDismissError: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  fileInputRef,
  onFilesChange,
  onTriggerFileInput,
  errorMessage,
  onDismissError
}) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <div style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))' }}>
          📖
        </div>
        <h1 className="text-shadow-lg" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 1rem 0', color: 'white' }}>
          CBRVerse
        </h1>
        <p className="text-shadow-sm" style={{ fontSize: '1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
          Arrastra tu cómic o selecciona un archivo para empezar
        </p>

        {errorMessage && (
          <div style={{ marginBottom: '1rem' }}>
            <ErrorAlert message={errorMessage} onDismiss={onDismissError} />
          </div>
        )}

        <div className="upload-section">
          <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.8 }}>
            ⬆️
          </div>
          <h2 className="text-shadow-sm" style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
            Selecciona tu cómic
          </h2>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
            Soportamos archivos CBR, CBZ y PDF
          </p>
          
          <Button className="btn-upload" onClick={onTriggerFileInput}>
            Examinar archivos
          </Button>
          
          <FileInput
            ref={fileInputRef}
            onChange={onFilesChange}
          />
          
          <div style={{ 
            padding: '0.8rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            fontSize: '0.85rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            💡 <span style={{ opacity: 0.8 }}>También puedes arrastrar archivos CBR/CBZ directamente aquí</span>
          </div>
        </div>
      </div>
    </div>
  );
};
