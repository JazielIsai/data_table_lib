# Migrar de v0.1.x a v2

La versión 2 amplía `Table` y `TableEdit` sin exigir cambios a las tablas básicas de v0.1.x. Los nombres `getColumns`, `getRows`, `getButtons` y `onCaption` siguen funcionando; para código nuevo se recomiendan `columns`, `rows`, `actions` y `caption`.

## Antes de instalar

La versión estable 2.0.0 se instala con la etiqueta predeterminada `latest`. Comprueba las etiquetas disponibles con `npm view @isai_dev/data_table_lib dist-tags --json` si necesitas reproducir una versión preliminar anterior.

```bash
npm install @isai_dev/data_table_lib
```

React y React DOM 18 o 19 son dependencias par. Conserva la importación del CSS:

```jsx
import { Table, TableEdit } from '@isai_dev/data_table_lib';
import '@isai_dev/data_table_lib/style.css';
```

## Cambios recomendados

| En v0.1.x | En v2 | Motivo |
| --- | --- | --- |
| `getColumns`, `getRows` | `columns`, `rows` | API coherente con los ejemplos y los tipos actuales. |
| `getButtons` | `actions` | API clara para acciones por fila. En `TableEdit`, `getButtons.onClick` recibe `(event, row)`; `actions.onClick` recibe `(row, event)`. |
| `onCaption` | `caption` | Nombre que expresa el valor mostrado. |
| `onSortChange(sort)` | `onSortChange(sort)` con `sort` también `null` | La galería puede elegir «Sin ordenar»; maneja `null` en el estado y en la consulta remota. |
| Columnas con `field` | Igual, con `getRowId` estable | Selección, borradores y vistas guardadas necesitan IDs que no cambien al ordenar. |

Ejemplo de actualización de acciones:

```jsx
// v0.1.x en TableEdit
<TableEdit getButtons={[{ label: 'Abrir', onClick: (event, row) => open(row) }]} />

// v2
<TableEdit actions={[{ label: 'Abrir', onClick: (row, event) => open(row) }]} />
```

No es necesario adoptar la galería, las vistas guardadas ni la edición por borrador para migrar una tabla simple. Activa cada función cuando la aplicación la necesite.

## Funciones nuevas

- Fotos: columna `type: 'image'` con URL o `{ src, alt, width, height, srcSet, sizes }`.
- Galería: `defaultLayout="gallery"`, `allowLayoutChange` y `gallery={{ imageField, titleField }}`.
- Preferencias: `columnPreferencesKey` y `layoutPreferencesKey` guardan elecciones en el navegador.
- Compartir vistas: `viewsKey`, `shareableViews` y `syncViewToUrl`.
- Edición: `editMode="save"` con `onSave` para validar y guardar un borrador por fila.
- Idioma: `locale="en"` cambia todos los textos integrados; `labels` permite sobrescribirlos. El valor predeterminado es `es`.

Consulta la [referencia de props](../README.md#referencia-de-props) y los [ejemplos ejecutables](../examples/README.md) para combinar estas funciones.

## Rendimiento

La tabla puede paginar localmente o delegar paginación, búsqueda y ordenamiento al servidor. Ejecuta `npm run benchmark:render` para medir 1 000 y 5 000 filas en Chrome. Es una medición de desarrollo, no una garantía de tiempo: depende del equipo y del contenido de cada celda. Si miles de filas deben verse a la vez sin páginas, mide primero la interacción real de tu aplicación antes de decidir si necesitas virtualización.

## Compatibilidad y versiones

Desde `2.0.0`, las correcciones compatibles incrementan `patch`, las funciones compatibles `minor` y los cambios incompatibles `major`. Los cambios incompatibles se documentan en este archivo y en las notas del Release. Cada versión publicada en npm debe corresponder a un tag y un Release del mismo código.
