# Publicar Data Table Lib

La página del proyecto, un Release de GitHub y un paquete instalable son publicaciones distintas:

| Destino | Qué ofrece | Estado inicial |
| --- | --- | --- |
| GitHub Pages | Sitio con documentación y ejemplos interactivos | Requiere activar Pages con GitHub Actions |
| GitHub Releases | Una versión identificada por un tag, notas y archivos descargables | No hay release hasta crearlo |
| GitHub Packages | Un paquete en el registro npm de GitHub | No se publica al crear un release |

## Sitio

El workflow `.github/workflows/pages.yml` compila `site/`. En **Settings → Pages → Build and deployment → Source**, elige **GitHub Actions**. Después ejecuta **Actions → Publish site → Run workflow** si el push inicial ya ocurrió antes de activar Pages. La URL esperada es <https://jazielisai.github.io/data_table_lib/>. No configures `isai-dev.com` como dominio de Pages: es el sitio personal del autor, enlazado desde la página de la librería.

## Primer release

1. Ejecuta `npm test` y `npm run build:site` en la versión que vas a publicar.
2. Confirma que `package.json` tiene la versión correcta; actualmente es `0.1.0`.
3. Abre **Releases → Create a new release** en GitHub.
4. Crea el tag `v0.1.0` apuntando a `main` y usa `v0.1.0` como título.
5. Describe los componentes (`Table`, `TableEdit`), compatibilidad con React 18/19, ejemplos y cambios conocidos. Publica el release.

GitHub ofrece automáticamente archivos ZIP y TAR del código de ese tag. Si quieres que el release tenga un archivo listo para instalar, genera `npm pack` y adjunta el `.tgz` a la publicación. El ZIP del código y el `.tgz` generado por npm cumplen funciones distintas.

Para una versión posterior, incrementa `version` en `package.json` (por ejemplo, con `npm version patch`), revisa el cambio, ejecuta pruebas y crea un tag y un release con la misma versión. No reutilices un tag para contenido diferente.

## Paquete instalable

**GitHub Packages** es un registro de paquetes distinto de Releases y de npmjs.com. Para publicar esta librería allí, primero hay que cambiar `name` a un nombre con ámbito, por ejemplo `@jazielisai/data_table_lib`, y configurar el registro `https://npm.pkg.github.com` para ese ámbito. La publicación requiere autenticación en GitHub con permisos de paquetes. Este cambio también modifica la ruta que los consumidores usarán en `import` y `npm install`; actualiza los ejemplos y el sitio antes de publicarlo.

Para facilitar la instalación pública con `npm install`, también puedes optar por **npmjs.com**. Es un registro separado y requiere una cuenta npm. Comprueba la disponibilidad del nombre, define un nombre estable, actualiza las importaciones y publica con `npm publish --access public` si el paquete tiene ámbito. No publiques en ninguno de los dos registros hasta decidir el nombre definitivo y una licencia para reutilizar el código.

El campo `author` de `package.json` y la firma en el sitio identifican al autor, [Jaziel Isaí](https://isai-dev.com). No se añade ningún coautor a los commits.
