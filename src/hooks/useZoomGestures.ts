import { useEffect, useRef } from 'react';

// Umbral de cambio en la distancia entre dedos para disparar un paso de zoom
const PINCH_RATIO_STEP = 1.1;

const getTouchDistance = (touches: TouchList): number => {
  const a = touches[0];
  const b = touches[1];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
};

// Zoom con Ctrl/Cmd + rueda del mouse y con pellizco (pinch) táctil.
// Usa listeners nativos con passive:false porque React marca onWheel/onTouchMove
// como pasivos por defecto, lo que impide preventDefault() ahí.
export const useZoomGestures = <T extends HTMLElement>(onZoomIn: () => void, onZoomOut: () => void) => {
  const ref = useRef<T | null>(null);
  const pinchBaseDistance = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      if (e.deltaY < 0) onZoomIn(); else onZoomOut();
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchBaseDistance.current = getTouchDistance(e.touches);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || pinchBaseDistance.current === null) return;
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      const ratio = distance / pinchBaseDistance.current;
      if (ratio >= PINCH_RATIO_STEP) {
        onZoomIn();
        pinchBaseDistance.current = distance;
      } else if (ratio <= 1 / PINCH_RATIO_STEP) {
        onZoomOut();
        pinchBaseDistance.current = distance;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchBaseDistance.current = null;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onZoomIn, onZoomOut]);

  return ref;
};
