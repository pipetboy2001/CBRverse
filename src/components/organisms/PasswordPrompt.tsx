import React, { useEffect, useRef, useState } from 'react';
import { Button, Icon } from '../atoms';

interface PasswordPromptProps {
  fileName: string;
  errorMessage: string | null;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export const PasswordPrompt: React.FC<PasswordPromptProps> = ({
  fileName,
  errorMessage,
  onSubmit,
  onCancel
}) => {
  const [password, setPassword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    if (password) onSubmit(password);
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <div style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))' }}>
          <Icon name="lock-fill" />
        </div>
        <h1 className="text-shadow-lg" style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
          Archivo protegido
        </h1>
        <p className="text-shadow-sm" style={{ fontSize: '1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
          "{fileName}" necesita una contraseña para abrirse
        </p>

        <div className="upload-section">
          <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              aria-label="Contraseña del archivo"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--color-border, rgba(100, 100, 100, 0.3))',
                background: 'var(--color-surface-btn, rgba(60, 60, 60, 0.8))',
                color: 'var(--color-text-primary, #e0e0e0)',
                fontSize: '1rem',
                marginBottom: '1rem'
              }}
            />

            {errorMessage && (
              <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {errorMessage}
              </p>
            )}

            <Button className="btn-upload" onClick={submit}>
              Desbloquear
            </Button>
          </form>

          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};
