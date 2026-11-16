import React from 'react';

interface ComicImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  id?: string;
  style?: React.CSSProperties;
}

export const ComicImage: React.FC<ComicImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'eager',
  id,
  style
}) => {
  return (
    <img
      id={id}
      src={src}
      alt={alt}
      className={`comic-image img-fluid ${className}`}
      loading={loading}
      style={style}
    />
  );
};
