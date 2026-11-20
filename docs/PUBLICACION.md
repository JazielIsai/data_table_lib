# Publicar Data Table Lib

La página del proyecto, un Release de GitHub y un paquete instalable son publicaciones distintas:

| Destino | Qué ofrece | Estado inicial |
| --- | --- | --- |
| GitHub Pages | Sitio con documentación y ejemplos interactivos | Publicado en <https://jazielisai.github.io/data_table_lib/> |
| GitHub Releases | Una versión identificada por un tag, notas y archivos descargables | `v0.1.0` y `v0.1.1` publicados; `v2.0.0-alpha.3` a `v2.0.0-alpha.5` como prereleases |
| GitHub Packages | Un paquete en el registro npm de GitHub | No se publica al crear un release |
| npmjs.com | Paquete que se instala con `npm install` | `latest`: `0.1.2`; `next`: `2.0.0-alpha.5`. |

## Sitio

El workflow `.github/workflows/pages.yml` compila `site/`. En **Settings → Pages → Build and deployment → Source**, elige **GitHub Actions**. Después ejecuta **Actions → Publish site → Run workflow** si el push inicial ya ocurrió antes de activar Pages. La URL esperada es <https://jazielisai.github.io/data_table_lib/>. No configures `isai-dev.com` como dominio de Pages: es el sitio personal del autor, enlazado desde la página de la librería.

## Releases

El primer release `v0.1.0` conserva el nombre anterior. La primera publicación en npm y el release `v0.1.1` usan `@isai_dev/data_table_lib` porque npm rechazó el nombre sin ámbito. Para instalar la versión pública usa `npm install @isai_dev/data_table_lib`.

La vista previa [v2.0.0-alpha.3](https://github.com/JazielIsai/data_table_lib/releases/tag/v2.0.0-alpha.3) está publicada como prerelease y adjunta el mismo paquete `.tgz` que se publicó en npm con la etiqueta `next`.

La vista previa [v2.0.0-alpha.4](https://github.com/JazielIsai/data_table_lib/releases/tag/v2.0.0-alpha.4) incluye columnas ajustables y exportación CSV. Su paquete `.tgz` está adjunto al Release y también está publicada en npm con la etiqueta `next`.

La vista previa [v2.0.0-alpha.5](https://github.com/JazielIsai/data_table_lib/releases/tag/v2.0.0-alpha.5) añade columnas fijadas y exportación remota asíncrona. Está en GitHub con un `.tgz` descargable y en npm con la etiqueta `next`. Publica cada versión desde su paquete `.tgz` correspondiente.

Antes de publicar una nueva versión, ejecuta `npm test`, `npm run build:site` y `npm pack --dry-run`. Confirma que la versión de `package.json` coincide con el tag del nuevo release.

GitHub ofrece automáticamente archivos ZIP y TAR del código de ese tag. Si quieres que el release tenga un archivo listo para instalar, genera `npm pack` y adjunta el `.tgz` a la publicación. El ZIP del código y el `.tgz` generado por npm cumplen funciones distintas.

Para versiones posteriores, incrementa `version` en `package.json` (por ejemplo, con `npm version patch`), revisa el cambio, ejecuta pruebas y crea un tag y un release con la misma versión. No reutilices un tag para contenido diferente.

## Paquete instalable

**GitHub Packages** es un registro de paquetes distinto de Releases y de npmjs.com. El paquete actual está preparado para **npmjs.com** bajo el ámbito de la cuenta npm `@isai_dev`. Para publicarlo también en GitHub Packages habría que usar un ámbito de GitHub (por ejemplo, `@jazielisai`), configurar `https://npm.pkg.github.com` y publicar ese paquete por separado; no cambies el registro de este paquete por accidente.

Antes de publicar, comprueba `npm whoami`, ejecuta `npm test` y `npm pack --dry-run`. La cuenta npm debe tener autenticación de dos factores para publicar. Una combinación de nombre y versión ya publicada no puede publicarse otra vez. Para futuras versiones, actualiza `version` en `package.json` y `package-lock.json` antes de publicar. La vista previa v2 usa el tag npm `next` para no sustituir la versión estable `latest`; se instala con `npm install @isai_dev/data_table_lib@next`. Publicar la página de ejemplos no publica el paquete en npm.

El campo `author` de `package.json` y la firma en el sitio identifican al autor, [Jaziel Isaí](https://isai-dev.com). No se añade ningún coautor a los commits.
