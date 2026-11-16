import React from 'react';
import { ComicImage } from '../atoms';

interface ComicViewerProps {
  images: string[];
  currentPanel: number;
  cascadeMode: boolean;
  rotation: 0 | 90 | 180 | 270;
}

export const ComicViewer: React.FC<ComicViewerProps> = ({
  images,
  currentPanel,
  cascadeMode,
  rotation
}) => {
  if (images.length === 0) return null;

  // shortcut: rotar solo visualmente (transform), no reajusta el layout
  // (a 90/270 una pagina no cuadrada puede desbordar el contenedor).
  // Subir a medir y swapear ancho/alto del contenedor si eso molesta.
  const rotateStyle: React.CSSProperties = rotation !== 0
    ? { transform: `rotate(${rotation}deg)` }
    : {};

  return (
    <>
      {/* Modo página individual */}
      {!cascadeMode && (
        <div className="text-center mb-4">
          <ComicImage
            id="comicImg"
            src={images[currentPanel] || ""}
            alt="comic panel"
            style={rotateStyle}
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
                style={rotateStyle}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};
