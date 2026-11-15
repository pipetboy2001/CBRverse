import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({ default: 'mock-worker-url' }));

const getDocument = vi.fn();
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {},
  getDocument: (...args: unknown[]) => getDocument(...args),
}));

const { processPdfFile } = await import('./pdfProcessor');

const fakePage = (pageNum: number) => ({
  getViewport: () => ({ width: 10, height: 10 }),
  render: () => ({
    promise: new Promise<void>((resolve) => setTimeout(resolve, pageNum === 1 ? 10 : 0)),
  }),
});

const fakePdf = (numPages: number) => ({
  numPages,
  getPage: (pageNum: number) => Promise.resolve(fakePage(pageNum)),
});

beforeEach(() => {
  getDocument.mockReset();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => {
    cb(new Blob(['page'], { type: 'image/png' }));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('processPdfFile', () => {
  it('convierte cada página en una imagen, en orden, aunque el render de una página tarde más', async () => {
    getDocument.mockReturnValue({ promise: Promise.resolve(fakePdf(3)) });
    const onProgress = vi.fn();

    const images = await processPdfFile(new File(['x'], 'comic.pdf'), onProgress);

    expect(images).toHaveLength(3);
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });

  it('propaga el error si el canvas no puede crear un contexto 2D', async () => {
    getDocument.mockReturnValue({ promise: Promise.resolve(fakePdf(1)) });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    await expect(processPdfFile(new File(['x'], 'comic.pdf'), vi.fn())).rejects.toThrow(
      'No se pudo crear el contexto del canvas'
    );
  });
});
