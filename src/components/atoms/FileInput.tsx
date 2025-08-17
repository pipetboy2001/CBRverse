import React, { forwardRef } from 'react';

interface FileInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  className?: string;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(({
  onChange,
  accept = ".cbr,.cbz,.zip,.rar,.pdf",
  className = ''
}, ref) => {
  return (
    <input
      ref={ref}
      type="file"
      onChange={onChange}
      accept={accept}
      className={`${className}`}
      style={{ display: 'none' }}
    />
  );
});

FileInput.displayName = 'FileInput';
