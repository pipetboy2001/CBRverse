import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = ''
}) => {
  return (
    <div className={`progress-custom ${className}`}>
      <div 
        className="progress-bar-custom" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
