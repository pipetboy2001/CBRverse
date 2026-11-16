# Librerías vendored

Estos archivos **no son dependencias npm**: son scripts estáticos que `useComicReader.ts` carga dinámicamente en el navegador (`<script src="/lib/...">`), fuera del lockfile y por lo tanto fuera del alcance de Dependabot/`npm audit`/el dependency graph de GitHub.

| Archivo | Origen | Licencia | Notas |
|---|---|---|---|
| `jszip.js` | [Stuk/jszip](https://github.com/Stuk/jszip) | MIT / GPLv3 (dual) | El header dice "(c) 2009-2014 Stuart Knightley" — corresponde a la línea **pre-3.x** de JSZip (antes de que el proyecto se mudara a `github.com/Stuk/jszip` y adoptara versionado semántico moderno). No se pudo determinar el número de versión exacto: el bundle no incluye ningún string de versión. |
| `uncompress.js` | [workhorsy/uncompress.js](https://github.com/workhorsy/uncompress.js) | MIT | Copyright 2017, Matthew Brennan Jones. Orquesta la carga de `jszip.js`/`libunrar.js` y expone `window.loadArchiveFormats`/`window.archiveOpenFile`. |
| `libuntar.js` | [workhorsy/uncompress.js](https://github.com/workhorsy/uncompress.js) | MIT | Copyright 2017, Matthew Brennan Jones. Parser de TAR puro JS, sin dependencias. |
| `libunrar.js` + `libunrar.js.mem` | Fork de [wcchoi/libunrar-js](https://github.com/wcchoi/libunrar-js) dentro de workhorsy/uncompress.js | MIT (wrapper) + UnRAR freeware license (`license_UnRAR.txt` del upstream, no incluido en este repo) | Build de Emscripten del C++ de UnRAR (Alexander L. Roshal, 1993-2013). `.mem` es el heap inicial del módulo WASM/asm.js — no es legible/auditable como texto. |

Los cuatro se agregaron en un solo commit (`0eff842`, 2025-08-17) y no se volvieron a actualizar desde entonces.

## Por qué no son paquetes npm

`uncompress.js` espera que `JSZip`/las rutinas de RAR/TAR existan como globals de `window`, no como módulos ES — por eso se cargan como scripts clásicos en vez de importarse. Reemplazar `jszip.js` por el paquete `jszip` de npm (que sí expone una build UMD compatible) es viable pero requiere probarlo contra archivos CBZ reales en un navegador antes de hacer el swap; no hay un equivalente npm mantenido para el camino RAR/TAR, así que ese seguiría vendored.

## Si hay que actualizar alguno

1. Confirmar la versión/commit exacto de origen antes de reemplazar el archivo.
2. Actualizar la fila correspondiente en la tabla de arriba.
3. Probar manualmente abrir un `.cbz`/`.cbr` real en el navegador — no hay tests automatizados que ejerciten estos archivos directamente (`useComicReader.test.ts` mockea `window.archiveOpenFile`).
