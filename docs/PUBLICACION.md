# Publicar Data Table Lib

La página del proyecto, un Release de GitHub y un paquete instalable son publicaciones distintas:

| Destino | Qué ofrece | Estado inicial |
| --- | --- | --- |
| GitHub Pages | Sitio con documentación y ejemplos interactivos | Publicado en <https://jazielisai.github.io/data_table_lib/> |
| GitHub Releases | Una versión identificada por un tag, notas y archivos descargables | `v0.1.0` publicado |
| GitHub Packages | Un paquete en el registro npm de GitHub | No se publica al crear un release |

## Sitio

El workflow `.github/workflows/pages.yml` compila `site/`. En **Settings → Pages → Build and deployment → Source**, elige **GitHub Actions**. Después ejecuta **Actions → Publish site → Run workflow** si el push inicial ya ocurrió antes de activar Pages. La URL esperada es <https://jazielisai.github.io/data_table_lib/>. No configures `isai-dev.com` como dominio de Pages: es el sitio personal del autor, enlazado desde la página de la librería.

## Releases

El primer release `v0.1.0` ya está publicado. La primera publicación en npm usa `@isai_dev/data_table_lib@0.1.1` porque npm rechazó el nombre anterior sin ámbito. Tras publicar el paquete, crea un release `v0.1.1` desde el commit que contiene el nuevo nombre, con notas que expliquen el cambio de instalación e importación.

Antes de publicar una nueva versión, ejecuta `npm test`, `npm run build:site` y `npm pack --dry-run`. Confirma que la versión de `package.json` coincide con el tag del nuevo release.

GitHub ofrece automáticamente archivos ZIP y TAR del código de ese tag. Si quieres que el release tenga un archivo listo para instalar, genera `npm pack` y adjunta el `.tgz` a la publicación. El ZIP del código y el `.tgz` generado por npm cumplen funciones distintas.

Para versiones posteriores, incrementa `version` en `package.json` (por ejemplo, con `npm version patch`), revisa el cambio, ejecuta pruebas y crea un tag y un release con la misma versión. No reutilices un tag para contenido diferente.

## Paquete instalable

**GitHub Packages** es un registro de paquetes distinto de Releases y de npmjs.com. El paquete actual está preparado para **npmjs.com** bajo el ámbito de la cuenta npm `@isai_dev`. Para publicarlo también en GitHub Packages habría que usar un ámbito de GitHub (por ejemplo, `@jazielisai`), configurar `https://npm.pkg.github.com` y publicar ese paquete por separado; no cambies el registro de este paquete por accidente.

Para publicar en **npmjs.com**, inicia sesión con `npm login`, comprueba `npm whoami`, ejecuta `npm pack --dry-run` y después `npm publish --access public`. La cuenta npm debe tener autenticación de dos factores para publicar. El nombre `@isai_dev/data_table_lib` se utiliza en todos los ejemplos, los tipos y la página. Decide una licencia para aclarar los permisos de reutilización del código.

El campo `author` de `package.json` y la firma en el sitio identifican al autor, [Jaziel Isaí](https://isai-dev.com). No se añade ningún coautor a los commits.
