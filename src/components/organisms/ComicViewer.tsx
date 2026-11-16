import React from 'react';
import { ComicImage } from '../atoms';

interface ComicViewerProps {
  images: string[];
  currentPanel: number;
  cascadeMode: boolean;
  zoomLevel: number;
}

export const ComicViewer: React.FC<ComicViewerProps> = ({
  images,
  currentPanel,
  cascadeMode,
  zoomLevel
}) => {
  if (images.length === 0) return null;

  const zoomStyle: React.CSSProperties = {
    width: `${zoomLevel}%`,
    maxWidth: zoomLevel > 100 ? 'none' : '100%'
  };

  return (
    <>
      {/* Modo página individual */}
      {!cascadeMode && (
        <div className="text-center mb-4 zoom-scroll-area">
          <ComicImage
            id="comicImg"
            src={images[currentPanel] || ""}
            alt="comic panel"
            style={zoomStyle}
          />
        </div>
      )}

      {/* Modo cascada - todas las imágenes */}
      {cascadeMode && (
        <div className="cascade-container">
          {images.map((imageSrc, index) => (
            <div key={index} className="cascade-page zoom-scroll-area">
              <div className="page-number">
                Página {index + 1}
              </div>
              <ComicImage
                src={imageSrc}
                alt={`Página ${index + 1}`}
                className="cascade-image"
                loading="lazy"
                style={zoomStyle}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};
