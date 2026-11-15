# CBRverse

Lector de cómics (CBR, CBZ, ZIP, RAR) y PDF, 100% en el navegador. Arrastrá un archivo o elegilo desde el selector, y lo leés página por página — sin subir nada a ningún servidor.

## Características

- Formatos soportados: `.cbr`, `.cbz`, `.zip`, `.rar`, `.pdf`.
- Drag & drop o selector de archivo.
- Modo página individual o modo cascada (todas las páginas en secuencia).
- Pantalla completa.
- Navegación por teclado (flechas / A-D, Home, End).

## Requisitos

- Node.js ≥ 22.19 (ver `engines` en `package.json`).

## Desarrollo

```bash
npm install
npm run dev
```

## Scripts disponibles

| Script            | Qué hace                                  |
| ----------------- | ------------------------------------------ |
| `npm run dev`      | Levanta el servidor de desarrollo (Vite). |
| `npm run build`    | Type-check (`tsc -b`) + build de producción. |
| `npm run lint`     | Corre ESLint sobre todo el proyecto.      |
| `npm run test`     | Corre la suite de tests (Vitest).         |
| `npm run preview`  | Sirve el build de producción localmente.  |

## Arquitectura

```
src/
  components/
    atoms/       # Button, Icon, FileInput, ComicImage, ProgressBar
    molecules/   # ConfigMenu, NavigationControls, LoadingModal, InfoAlert, NavbarTitle
    organisms/   # Header, Footer, WelcomeScreen, ComicViewer
    templates/   # ComicReaderTemplate
  hooks/         # useComicReader, useViewMode, useUIState, useKeyboardNavigation, pdfProcessor
  pages/         # ComicReaderPage
  types/         # tipos compartidos
public/lib/      # librerías de descompresión vendored (jszip, libunrar, libuntar, uncompress)
```

El PDF se procesa con [`pdfjs-dist`](https://www.npmjs.com/package/pdfjs-dist) (dependencia npm). Los formatos CBR/CBZ/ZIP/RAR se procesan con librerías vendored en `public/lib/`, cargadas dinámicamente en el navegador.

## Contribuir

Ver [CONTRIBUTING.md](./CONTRIBUTING.md).

## Licencia

[MIT](./LICENSE)
