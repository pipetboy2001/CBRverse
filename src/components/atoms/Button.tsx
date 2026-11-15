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
    switch (variant) {
      case 'primary':
        return 'btn btn-primary';
      case 'navbar':
        return 'navbar-config-btn';
      case 'footer':
        return 'btn footer-btn';
      case 'secondary':
      default:
        return 'btn btn-secondary';
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
