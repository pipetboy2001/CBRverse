import React from 'react';
import { ComicImage } from '../atoms';

interface ComicViewerProps {
  images: string[];
  currentPanel: number;
  cascadeMode: boolean;
}

export const ComicViewer: React.FC<ComicViewerProps> = ({
  images,
  currentPanel,
  cascadeMode
}) => {
  if (images.length === 0) return null;

  return (
    <>
      {/* Modo página individual */}
      {!cascadeMode && (
        <div className="text-center mb-4">
          <ComicImage 
            id="comicImg" 
            src={images[currentPanel] || ""}
            alt="comic panel"
          />
        </div>
      )}

      {/* Modo cascada - todas las imágenes */}
      {cascadeMode && (
        <div className="cascade-container">
          {images.map((imageSrc, index) => (
            <div key={index} className="cascade-page">
              <div className="page-number">
                Página {index + 1}
              </div>
              <ComicImage 
                src={imageSrc}
                alt={`Página ${index + 1}`}
                className="cascade-image"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};
