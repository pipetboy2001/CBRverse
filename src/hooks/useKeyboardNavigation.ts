import { useEffect } from 'react';
import type { ReadingDirection } from '../types';

export const useKeyboardNavigation = (
  images: string[],
  currentPanel: number,
  cascadeMode: boolean,
  onPrevious: () => void,
  onNext: () => void,
  onGoToPage: (page: number) => void,
  scrollToPage: (page: number) => void,
  readingDirection: ReadingDirection = 'comic'
) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (images.length === 0) return;
      
      if (cascadeMode) {
        // En modo cascada, hacer scroll suave entre páginas
        switch(e.key) {
          case 'ArrowLeft':
          case 'a':
          case 'A':
            e.preventDefault();
            if (currentPanel > 0) {
              const newPanel = currentPanel - 1;
              onGoToPage(newPanel);
              scrollToPage(newPanel);
            }
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            e.preventDefault();
            if (currentPanel < images.length - 1) {
              const newPanel = currentPanel + 1;
              onGoToPage(newPanel);
              scrollToPage(newPanel);
            }
            break;
          case 'Home':
            e.preventDefault();
            onGoToPage(0);
            scrollToPage(0);
            break;
          case 'End': {
            e.preventDefault();
            const lastPanel = images.length - 1;
            onGoToPage(lastPanel);
            scrollToPage(lastPanel);
            break;
          }
        }
      } else {
        // Modo página individual: en manga, izquierda avanza y derecha retrocede
        const manga = readingDirection === 'manga';
        switch(e.key) {
          case 'ArrowLeft':
          case 'a':
          case 'A':
            e.preventDefault();
            if (manga) onNext(); else onPrevious();
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            e.preventDefault();
            if (manga) onPrevious(); else onNext();
            break;
          case 'Home':
            e.preventDefault();
            onGoToPage(0);
            break;
          case 'End':
            e.preventDefault();
            onGoToPage(images.length - 1);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentPanel, images, cascadeMode, readingDirection, onPrevious, onNext, onGoToPage, scrollToPage]);
};
