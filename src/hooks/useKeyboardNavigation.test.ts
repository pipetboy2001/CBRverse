import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardNavigation } from './useKeyboardNavigation';

const press = (key: string) => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }));
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useKeyboardNavigation', () => {
  it('no hace nada si no hay imágenes cargadas', () => {
    const onNext = vi.fn();
    renderHook(() =>
      useKeyboardNavigation([], 0, false, vi.fn(), onNext, vi.fn(), vi.fn())
    );

    press('ArrowRight');

    expect(onNext).not.toHaveBeenCalled();
  });

  describe('modo página individual (cascadeMode = false)', () => {
    it('ArrowRight/D llama a onNext, ArrowLeft/A llama a onPrevious', () => {
      const onPrevious = vi.fn();
      const onNext = vi.fn();
      renderHook(() =>
        useKeyboardNavigation(['a.png', 'b.png'], 0, false, onPrevious, onNext, vi.fn(), vi.fn())
      );

      press('ArrowRight');
      press('d');
      expect(onNext).toHaveBeenCalledTimes(2);

      press('ArrowLeft');
      press('A');
      expect(onPrevious).toHaveBeenCalledTimes(2);
    });

    it('Home/End van a la primera/última página', () => {
      const onGoToPage = vi.fn();
      renderHook(() =>
        useKeyboardNavigation(['a.png', 'b.png', 'c.png'], 1, false, vi.fn(), vi.fn(), onGoToPage, vi.fn())
      );

      press('Home');
      expect(onGoToPage).toHaveBeenCalledWith(0);

      press('End');
      expect(onGoToPage).toHaveBeenCalledWith(2);
    });
  });

  describe('modo cascada (cascadeMode = true)', () => {
    it('ArrowRight avanza y hace scroll solo si no está en la última página', () => {
      const onGoToPage = vi.fn();
      const scrollToPage = vi.fn();
      const { rerender } = renderHook(
        ({ currentPanel }) =>
          useKeyboardNavigation(['a.png', 'b.png'], currentPanel, true, vi.fn(), vi.fn(), onGoToPage, scrollToPage),
        { initialProps: { currentPanel: 0 } }
      );

      press('ArrowRight');
      expect(onGoToPage).toHaveBeenCalledWith(1);
      expect(scrollToPage).toHaveBeenCalledWith(1);

      onGoToPage.mockClear();
      scrollToPage.mockClear();
      rerender({ currentPanel: 1 });

      press('ArrowRight');
      expect(onGoToPage).not.toHaveBeenCalled();
      expect(scrollToPage).not.toHaveBeenCalled();
    });

    it('ArrowLeft no retrocede antes de la primera página', () => {
      const onGoToPage = vi.fn();
      renderHook(() =>
        useKeyboardNavigation(['a.png', 'b.png'], 0, true, vi.fn(), vi.fn(), onGoToPage, vi.fn())
      );

      press('ArrowLeft');

      expect(onGoToPage).not.toHaveBeenCalled();
    });
  });
});
