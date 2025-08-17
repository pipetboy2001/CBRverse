import React from 'react';

interface ComicImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  id?: string;
}

export const ComicImage: React.FC<ComicImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'eager',
  id
}) => {
  return (
    <img 
      id={id}
      src={src}
      alt={alt}
      className={`comic-image img-fluid ${className}`}
      loading={loading}
    />
  );
};
