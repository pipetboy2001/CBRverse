import React from 'react';

interface ErrorAlertProps {
  message: string | null;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="alert alert-block alert-error" role="alert">
      <button type="button" className="close" onClick={onDismiss}>×</button>
      <p>{message}</p>
    </div>
  );
};
