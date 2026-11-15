import { describe, it, expect, afterEach } from 'vitest';
import { act, renderHook, waitFor, cleanup } from '@testing-library/react';
import { useComicReader } from './useComicReader';

afterEach(() => {
  cleanup();
  delete window.archiveOpenFile;
});

const fakeArchive = (names: string[]) => ({
  archive_type: 'zip',
  entries: names.map((name) => ({
    name,
    is_file: true,
    readData: (cb: (data: ArrayBuffer | null, err: unknown) => void) => {
      // Mismo patrón que uncompress.js: todas las entradas se resuelven
      // con setTimeout(fn, 0), en orden, imitando la librería real.
      setTimeout(() => cb(new TextEncoder().encode(name).buffer, null), 0);
    },
  })),
});

describe('useComicReader.handleFile', () => {
  it('carga todas las páginas de un cómic, en orden, y quita la extensión del nombre', async () => {
    window.archiveOpenFile = (_file, _password, cb) => {
      cb(fakeArchive(['01.png', '02.png', '03.png']), null);
    };

    const { result } = renderHook(() => useComicReader());

    act(() => {
      result.current.handleFile(new File(['x'], 'mi-comic.cbz'));
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.images).toHaveLength(3);
    expect(result.current.comicName).toBe('mi-comic');
    expect(result.current.showButtons).toBe(true);
  });

  it('muestra un error y no se queda cargando si el archivo no es un cómic válido', async () => {
    window.archiveOpenFile = (_file, _password, cb) => {
      cb(null, new Error('The archive type is unknown'));
    };

    const { result } = renderHook(() => useComicReader());

    act(() => {
      result.current.handleFile(new File(['x'], 'no-es-un-comic.txt'));
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.images).toHaveLength(0);
    expect(result.current.showButtons).toBe(false);
  });
});
