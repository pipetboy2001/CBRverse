import React from 'react';
import { ComicImage, Icon } from '../atoms';
import type { ReadingDirection } from '../../types';

interface ComicViewerProps {
  images: string[];
  currentPanel: number;
  cascadeMode: boolean;
  zoomLevel: number;
  readingDirection: ReadingDirection;
  onPrevious: () => void;
  onNext: () => void;
}

export const ComicViewer: React.FC<ComicViewerProps> = ({
  images,
  currentPanel,
  cascadeMode,
  zoomLevel,
  readingDirection,
  onPrevious,
  onNext
}) => {
  if (images.length === 0) return null;

  const zoomStyle: React.CSSProperties = {
    width: `${zoomLevel}%`,
    maxWidth: zoomLevel > 100 ? 'none' : '100%'
  };

  // En manga la mitad izquierda avanza y la derecha retrocede; en comic es al revés
  const manga = readingDirection === 'manga';
  const leftAction = manga ? onNext : onPrevious;
  const rightAction = manga ? onPrevious : onNext;
  const leftDisabled = manga ? currentPanel >= images.length - 1 : currentPanel === 0;
  const rightDisabled = manga ? currentPanel === 0 : currentPanel >= images.length - 1;
  const leftLabel = manga ? 'Página siguiente' : 'Página anterior';
  const rightLabel = manga ? 'Página anterior' : 'Página siguiente';

  return (
    <>
      {/* Modo página individual */}
      {!cascadeMode && (
        <div className="text-center mb-4 zoom-scroll-area tap-read-area">
          <ComicImage
            id="comicImg"
            src={images[currentPanel] || ""}
            alt="comic panel"
            style={zoomStyle}
          />
          <button
            type="button"
            className="tap-zone tap-zone-left"
            onClick={leftAction}
            disabled={leftDisabled}
            aria-label={leftLabel}
          >
            <Icon name="chevron-left" />
          </button>
          <button
            type="button"
            className="tap-zone tap-zone-right"
            onClick={rightAction}
            disabled={rightDisabled}
            aria-label={rightLabel}
          >
            <Icon name="chevron-right" />
          </button>
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
