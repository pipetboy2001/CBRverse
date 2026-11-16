# Política de seguridad

## Versiones soportadas

CBRverse no tiene releases versionados todavía; se da soporte de seguridad solo a la rama `main`.

## Reportar una vulnerabilidad

Si encontrás una vulnerabilidad de seguridad, por favor **no abras un issue público**. En su lugar, usá el reporte privado de GitHub:

1. Entrá a la pestaña [Security](https://github.com/pipetboy2001/CBRverse/security) del repositorio.
2. Hacé clic en "Report a vulnerability" para abrir un reporte privado.

Vamos a confirmar la recepción y responder con una evaluación inicial lo antes posible.

## Alcance

CBRverse es una aplicación 100% cliente (sin backend, sin autenticación, sin datos persistidos del usuario). El principal riesgo relevante es el procesamiento de archivos `.cbr`/`.cbz`/`.zip`/`.rar`/`.pdf` provistos por el usuario en el navegador, incluyendo las librerías de descompresión vendored en `public/lib/`.
