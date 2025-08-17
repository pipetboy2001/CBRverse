import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({
  name,
  className = '',
  size = 'md',
  style
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      case 'md':
      default:
        return '';
    }
  };

  return (
    <i 
      className={`bi bi-${name} ${getSizeClass()} ${className}`} 
      style={style}
    />
  );
};
