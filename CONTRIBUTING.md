# Contribuir a CBRverse

## Setup local

```bash
npm install
npm run dev
```

Node.js ≥ 22.19 (ver `engines` en `package.json`).

## Flujo de trabajo

1. Si no existe, abrí un issue describiendo el bug o la mejora.
2. Creá una rama desde `dev` (la rama de integración activa) con el nombre `tipo/numero-issue-slug-corto`, por ejemplo `fix/28-cbr-page-order` o `docs/16-readme`.
3. Hacé los cambios.
4. Antes de abrir el PR, corré localmente:
   ```bash
   npm run lint
   npm run test
   npm run build
   ```
5. Abrí el PR contra `dev` y enlazá el issue (`Closes #N`).

## Convención de commits

El proyecto sigue [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope opcional): descripción corta en infinitivo o imperativo
```

Tipos usados en el historial: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `ci`, `build`, `perf`.

Ejemplos reales del repo:

- `fix(reader): corregir condición de carrera en la carga de jszip/uncompress`
- `chore(deps): configurar Dependabot para npm y github-actions`
- `test(reader): agregar vitest y un test de carga de archivo`

## Tests

Los tests usan Vitest + Testing Library (`npm run test`). Si tu cambio agrega lógica nueva no trivial (una rama condicional, un parser, manejo de errores), agregá o extendé un test que la cubra — no hace falta cobertura exhaustiva, pero sí una prueba de que el caso funciona.

## Pull requests

- Un PR por issue.
- CI (`npm run lint && npm run test && npm run build`) debe pasar antes de mergear — es un check requerido en `main` y se espera lo mismo para `dev`.
