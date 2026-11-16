import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, renderHook, waitFor, cleanup } from '@testing-library/react';
import { useComicReader } from './useComicReader';

afterEach(() => {
  cleanup();
  delete window.archiveOpenFile;
});

const fakeArchive = (names: string[], delays?: Record<string, number>) => ({
  archive_type: 'zip',
  entries: names.map((name) => ({
    name,
    is_file: true,
    readData: (cb: (data: ArrayBuffer | null, err: unknown) => void) => {
      // Delay configurable por entrada: simula que la descompresión no
      // siempre termina en el orden en que se pidió (ver issue #28).
      setTimeout(() => cb(new TextEncoder().encode(name).buffer, null), delays?.[name] ?? 0);
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

  it('mantiene el orden de las páginas aunque las entradas terminen de descomprimir en otro orden (issue #28)', async () => {
    const blobsByUrl = new Map<string, Blob>();
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation((obj) => {
      const url = `blob:test-${blobsByUrl.size}`;
      blobsByUrl.set(url, obj as Blob);
      return url;
    });

    window.archiveOpenFile = (_file, _password, cb) => {
      // '01.png' es la entrada más "pesada": termina de descomprimir última.
      cb(fakeArchive(['01.png', '02.png', '03.png'], { '01.png': 30, '02.png': 20, '03.png': 5 }), null);
    };

    const { result } = renderHook(() => useComicReader());

    act(() => {
      result.current.handleFile(new File(['x'], 'mi-comic.cbz'));
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const pageNames = await Promise.all(
      result.current.images.map((url) => blobsByUrl.get(url)!.text())
    );
    expect(pageNames).toEqual(['01.png', '02.png', '03.png']);

    createObjectURLSpy.mockRestore();
  });

  it('rechaza un archivo que supera el límite de tamaño sin intentar abrirlo (issue #41)', () => {
    const archiveOpenFile = vi.fn();
    window.archiveOpenFile = archiveOpenFile;

    const hugeFile = new File(['x'], 'enorme.cbz');
    Object.defineProperty(hugeFile, 'size', { value: 600 * 1024 * 1024 });

    const { result } = renderHook(() => useComicReader());

    act(() => {
      result.current.handleFile(hugeFile);
    });

    expect(archiveOpenFile).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('no se queda cargando para siempre si el lector de archivos no llegó a cargar (issue #31)', async () => {
    delete window.archiveOpenFile;

    const { result } = renderHook(() => useComicReader());

    act(() => {
      result.current.handleFile(new File(['x'], 'mi-comic.cbz'));
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.images).toHaveLength(0);
    expect(result.current.showButtons).toBe(false);
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
