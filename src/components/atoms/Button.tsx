import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'navbar' | 'footer';
  className?: string;
  title?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  title
}) => {
  const getButtonClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-in-out focus:outline-none';
    
    switch (variant) {
      case 'primary':
        return `btn btn-primary ${baseClasses}`;
      case 'navbar':
        return `navbar-config-btn ${baseClasses}`;
      case 'footer':
        return `btn footer-btn ${baseClasses}`;
      case 'secondary':
      default:
        return `btn btn-secondary ${baseClasses}`;
    }
  };

  return (
    <button
      className={`${getButtonClasses()} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};
