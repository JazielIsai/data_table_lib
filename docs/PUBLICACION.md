# Publicar Data Table Lib

La página del proyecto, un Release de GitHub y un paquete instalable son publicaciones distintas:

| Destino | Qué ofrece | Estado inicial |
| --- | --- | --- |
| GitHub Pages | Sitio con documentación y ejemplos interactivos | Publicado en <https://jazielisai.github.io/data_table_lib/> |
| GitHub Releases | Una versión identificada por un tag, notas y archivos descargables | `v0.1.0` y `v0.1.1` publicados; `v2.0.0-alpha.3` a `v2.0.0-alpha.8` como prereleases |
| GitHub Packages | Un paquete en el registro npm de GitHub | No se publica al crear un release |
| npmjs.com | Paquete que se instala con `npm install` | Comprueba las etiquetas actuales con `npm view @isai_dev/data_table_lib dist-tags`. |

## Sitio

El workflow `.github/workflows/pages.yml` compila `site/`. En **Settings → Pages → Build and deployment → Source**, elige **GitHub Actions**. Después ejecuta **Actions → Publish site → Run workflow** si el push inicial ya ocurrió antes de activar Pages. La URL esperada es <https://jazielisai.github.io/data_table_lib/>. No configures `isai-dev.com` como dominio de Pages: es el sitio personal del autor, enlazado desde la página de la librería.

La página usa `site/public/social-preview.png` como imagen al compartir su enlace. La misma portada aparece al inicio del README en `docs/social-preview.png`. Si actualizas el diseño o los retratos, en macOS puedes regenerar ambas copias con `swift scripts/generate-social-preview.swift`.

Para que GitHub muestre esa portada al compartir **el repositorio**, abre **Settings → General → Social preview → Edit → Upload an image** y sube `docs/social-preview.png`. GitHub no ofrece una API pública para cambiar esta imagen; subir el archivo al repositorio por sí solo no modifica la vista social del repositorio.

## Releases

El primer release `v0.1.0` conserva el nombre anterior. La primera publicación en npm y el release `v0.1.1` usan `@isai_dev/data_table_lib` porque npm rechazó el nombre sin ámbito. Para instalar la versión pública usa `npm install @isai_dev/data_table_lib`.

La vista previa [v2.0.0-alpha.3](https://github.com/JazielIsai/data_table_lib/releases/tag/v2.0.0-alpha.3) está publicada como prerelease y adjunta el mismo paquete `.tgz` que se publicó en npm con la etiqueta `next`.

La vista previa [v2.0.0-alpha.4](https://github.com/JazielIsai/data_table_lib/releases/tag/v2.0.0-alpha.4) incluye columnas ajustables y exportación CSV. Su paquete `.tgz` está adjunto al Release y también está publicada en npm con la etiqueta `next`.

La vista previa [v2.0.0-alpha.5](https://github.com/JazielIsai/data_table_lib/releases/tag/v2.0.0-alpha.5) añade columnas fijadas y exportación remota asíncrona. Está en GitHub con un `.tgz` descargable y en npm con la etiqueta `next`. Publica cada versión desde su paquete `.tgz` correspondiente.

La vista previa [v2.0.0-alpha.6](https://github.com/JazielIsai/data_table_lib/releases/tag/v2.0.0-alpha.6) añade la presentación visual, ejemplos de catálogo, directorio y datos remotos, y metadatos para encontrar el paquete. Su `.tgz` está adjunto al Release. npm aceptó el envío, pero `alpha.6` todavía no aparecía en el registro público en la última comprobación; verifica la versión antes de anunciarla como instalable.

La vista previa [v2.0.0-alpha.7](https://github.com/JazielIsai/data_table_lib/releases/tag/v2.0.0-alpha.7) añade vistas guardadas por nombre y enlaces para compartir búsqueda, filtros, columnas y presentación. El sitio público incluye una demo interactiva de la función. Su disponibilidad en npm debe comprobarse por separado del Release de GitHub.

La vista previa [v2.0.0-alpha.8](https://github.com/JazielIsai/data_table_lib/releases/tag/v2.0.0-alpha.8) añade casillas, interruptores, opciones únicas y múltiples, y más tipos de input. `Table` los muestra en lectura y `TableEdit` permite modificarlos en modo inmediato o con borrador por fila. La página pública incluye una demo **Inputs**. Su disponibilidad en npm también debe comprobarse por separado.

Antes de publicar una nueva versión, ejecuta `npm test`, `npm run build:site` y `npm pack --dry-run`. Confirma que la versión de `package.json` coincide con el tag del nuevo release. El workflow `.github/workflows/publish-npm.yml` se ejecuta al **publicar** un Release y comprueba esa coincidencia antes de publicar el paquete.

GitHub ofrece automáticamente archivos ZIP y TAR del código de ese tag. Si quieres que el release tenga un archivo listo para instalar, genera `npm pack` y adjunta el `.tgz` a la publicación. El ZIP del código y el `.tgz` generado por npm cumplen funciones distintas.

Para versiones posteriores, incrementa `version` en `package.json` (por ejemplo, con `npm version patch`), revisa el cambio, ejecuta pruebas y crea un tag y un release con la misma versión. No reutilices un tag para contenido diferente.

## Paquete instalable

**GitHub Packages** es un registro de paquetes distinto de Releases y de npmjs.com. El paquete actual está preparado para **npmjs.com** bajo el ámbito de la cuenta npm `@isai_dev`. Para publicarlo también en GitHub Packages habría que usar un ámbito de GitHub (por ejemplo, `@jazielisai`), configurar `https://npm.pkg.github.com` y publicar ese paquete por separado; no cambies el registro de este paquete por accidente.

Para activar la publicación automática, abre la configuración de `@isai_dev/data_table_lib` en npmjs.com → **Settings → Trusted publishing** y añade GitHub Actions con estos datos: usuario **JazielIsai**, repositorio **data_table_lib**, archivo de workflow **publish-npm.yml** (sólo el nombre, sin `.github/workflows/`). Permite la acción **npm publish**; deja vacío el nombre de entorno porque el workflow no declara uno. El primer Release publicado después de configurar esta relación ejecutará el workflow con OIDC, sin un token npm permanente. [Guía oficial de npm](https://docs.npmjs.com/trusted-publishers/).

El workflow usa `next` para versiones preliminares (por ejemplo, `2.0.0-alpha.9`) y `latest` para versiones estables. Si falla una publicación, corrige el workflow en `main` y ejecútalo desde **Actions → Publish npm → Run workflow** con el tag de ese Release; el workflow comprueba que el tag solicitado coincida con `package.json`. No ejecutes el reintento si esa versión ya está en npm. Comprueba el resultado con `npm view @isai_dev/data_table_lib dist-tags --json` y `npm view @isai_dev/data_table_lib@VERSION version`. Una combinación de nombre y versión ya publicada no puede publicarse otra vez. Actualiza `version` en `package.json` y `package-lock.json` antes del Release. La vista previa v2 se instala con `npm install @isai_dev/data_table_lib@next`; publicar la página de ejemplos no publica el paquete en npm.

Si aún no has configurado Trusted Publishing, puedes publicar manualmente con una sesión npm válida: `npm whoami`, `npm test`, `npm pack --dry-run` y `npm publish --access public --tag next`. La cuenta debe cumplir los requisitos de autenticación de npm. No publiques manualmente la misma versión después de que el workflow la haya publicado.

El campo `author` de `package.json` y la firma en el sitio identifican al autor, [Jaziel Isaí](https://isai-dev.com). No se añade ningún coautor a los commits.
