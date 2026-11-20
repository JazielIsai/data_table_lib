# Data Table Lib

**Tablas React que también se convierten en galerías de fotos, con edición y preferencias listas para usar.**

[![Vista visual de Data Table Lib: los mismos datos como tabla y galería](https://jazielisai.github.io/data_table_lib/social-preview.png)](https://jazielisai.github.io/data_table_lib/#demo)

[Probar la demo](https://jazielisai.github.io/data_table_lib/#demo) · [Ver tres ejemplos completos](https://github.com/JazielIsai/data_table_lib/tree/main/examples) · [Instalar desde npm](https://www.npmjs.com/package/@isai_dev/data_table_lib)

```bash
npm install @isai_dev/data_table_lib@next
```

```jsx
import { Table } from '@isai_dev/data_table_lib';
import '@isai_dev/data_table_lib/style.css';
const rows = [{ id: 1, name: 'Ana', photo: { src: '/ana.jpg', alt: 'Ana' } }];
const columns = [{ field: 'photo', type: 'image' }, { field: 'name', headerName: 'Nombre' }];
export default function App() {
  return <Table rows={rows} columns={columns} allowLayoutChange
    gallery={{ imageField: 'photo', titleField: 'name' }} />;
}
```

Incluye `Table` y `TableEdit`, CSS independiente, tipos TypeScript y ejemplos con catálogo, directorio y datos remotos.

Creada por [Jaziel Isaí](https://isai-dev.com).

Licencia [MIT](./LICENSE). Puedes usar, modificar y distribuir la librería conservando el aviso de copyright y la licencia.

> La versión 2 está disponible como vista previa en npm mediante la etiqueta `next`. La instalación predeterminada sigue usando la versión estable.

## Instalar y ejecutar

Requiere React y React DOM 18 o 19 en la aplicación. Para desarrollar o compilar este repositorio se recomienda Node.js 22.12+ (también 24 o 26 LTS); [Vite 8 admite Node 20.19+ o 22.12+](https://vite.dev/guide/). La librería está publicada en npm como [`@isai_dev/data_table_lib`](https://www.npmjs.com/package/@isai_dev/data_table_lib).

En tu proyecto:

```bash
npm install @isai_dev/data_table_lib
```

Para probar las funciones de fotos, galería y personalización de v2:

```bash
npm install @isai_dev/data_table_lib@next
```

Después importa los componentes y el CSS:

```jsx
import { Table, TableEdit } from '@isai_dev/data_table_lib';
import '@isai_dev/data_table_lib/style.css';
```

Para desarrollar este repositorio:

```bash
npm install
npm start                 # demo local
npm test                  # compila y ejecuta las pruebas
npm pack                  # crea el archivo instalable .tgz
```

También puedes instalar el archivo generado con `npm install /ruta/al/archivo.tgz` si necesitas probar una compilación local.

## Ejemplos ejecutables

`npm run examples` compila la librería y sirve [siete ejemplos independientes](https://github.com/JazielIsai/data_table_lib/tree/main/examples) en `http://localhost:5173/examples/`: catálogo de productos, directorio con fotos, panel de datos remotos, tabla local, edición con validación, vistas guardadas y controles de formulario. Cada ejemplo importa las entradas públicas del paquete, igual que una aplicación consumidora.

## Fotos, galería y acciones (vista previa de la versión 2)

Usa `type: 'image'` para mostrar una URL o un objeto `{ src, alt }` en una columna. El desarrollador puede elegir la vista inicial: `avatar`, `thumbnail`, `large` o `hidden`. Con `allowImageViewChange`, quien usa la tabla puede cambiarla desde un selector. `imageView` y `onImageViewChange` permiten controlar la elección desde la aplicación; `defaultImageView` inicia el estado interno cuando no está controlado.

```jsx
const [imageView, setImageView] = useState('avatar');
const columns = [
  { field: 'photo', headerName: 'Foto', type: 'image', searchable: false,
    imageFit: 'cover', imageFallback: 'Sin foto', previewable: true },
  { field: 'name', headerName: 'Nombre', sortable: true, hideable: false },
  { field: 'team', headerName: 'Equipo', filterable: true }
];
const rows = [{ id: 1, name: 'Ana', team: 'Diseño', photo: {
  src: '/photos/ana-800.jpg', alt: 'Retrato de Ana',
  srcSet: '/photos/ana-400.jpg 400w, /photos/ana-800.jpg 800w',
  sizes: '(max-width: 640px) 90vw, 33vw', width: 800, height: 600 } }];

<Table columns={columns} rows={rows}
  defaultLayout="gallery" allowLayoutChange
  layoutPreferencesKey="mi-tabla-vista"
  gallery={{ imageField: 'photo', titleField: 'name',
    descriptionField: 'team' }}
  imageView={imageView} onImageViewChange={setImageView}
  allowImageViewChange searchable selectable
  bulkActions={[{ label: 'Ver selección',
    onClick: (loadedRows, ids) => showSelection(loadedRows, ids) }]}
  allowColumnCustomization columnPreferencesKey="mi-tabla-personas"
  actions={[{ label: 'Ver perfil', iconName: 'view', iconOnly: true,
    variant: 'primary', onClick: (row) => openProfile(row) }]}
/>;
```

Los valores de imagen sin URL o con error de carga muestran `imageFallback` (por defecto, “Sin foto”). Usa un `alt` descriptivo para fotos con significado; también puedes definir `imageAlt(value, row)`. `imageFit` acepta `cover` o `contain` e `imagePosition` ajusta el recorte. La búsqueda global omite columnas de imagen por defecto; `searchable: true` permite buscar por el texto alternativo. Si tienes imágenes de varios tamaños, pasa `srcSet` y `sizes` para que el navegador elija la adecuada; `width` y `height` proporcionan sus dimensiones originales. Sin `srcSet`, la librería sigue usando `src` como antes.

`previewable: true` abre la foto en un diálogo modal con botones para recorrer las fotos de la página actual. El diálogo se cierra con su botón o con Escape. Si necesitas tu propio visor, define `onImageClick(value, row)` en la columna; esa función sustituye al diálogo integrado. Sólo se amplían imágenes que tienen URL.

Cuando las imágenes son el contenido principal, `defaultLayout="gallery"` muestra tarjetas con una foto grande y texto breve, siguiendo la [recomendación de Apple para colecciones con muchas imágenes](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables). `allowLayoutChange` añade los botones **Tabla** y **Galería**. `layout` / `onLayoutChange` controlan la presentación desde la aplicación; `layoutPreferencesKey` guarda la elección en `localStorage` con una clave distinta de `columnPreferencesKey`.

`gallery.imageField` elige la columna de imagen; `titleField` y `descriptionField` eligen el texto. Si se omiten, se usa la primera columna de imagen y la primera columna de texto visible. Por defecto, `aspectRatio: 'auto'` respeta la proporción original de cada foto: imágenes horizontales, verticales y cuadradas se muestran completas en la misma galería. Si prefieres tarjetas uniformes, usa `landscape` (4:3), `square` (1:1) o `portrait` (3:4); estos formatos pueden recortar la imagen según `imageFit`. `cardSize` acepta `comfortable` o `compact`. `renderDetails(row, rowIndex)` añade contenido personalizado debajo del texto. La galería permite ordenar columnas `sortable` y filtrar columnas `filterable`, además de usar búsqueda, paginación, selección, acciones y visor de fotos. **Sin ordenar** llama `onSortChange(null)` cuando el orden es controlado. El tamaño de avatar o miniatura y la personalización de columnas sólo afectan a la tabla. `TableEdit` sigue usando la tabla para conservar los controles de edición.

`bulkActions` muestra una barra cuando hay filas seleccionadas, en tabla o galería. Cada acción recibe `(loadedRows, selectedIds, event)`: `selectedIds` contiene toda la selección, incluso IDs de otras páginas; `loadedRows` contiene sólo las filas presentes en `rows`. El botón **Limpiar selección** borra la selección mediante `onSelectionChange` si está controlada.

`allowColumnCustomization` muestra un panel para ocultar y mover columnas con teclado o ratón. `hideable: false` y `reorderable: false` bloquean esos cambios para una columna; `hidden: true` la oculta siempre. El panel impide ocultar la última columna visible. `columnPreferencesKey` guarda el orden y la visibilidad en `localStorage` del navegador; usa una clave única por tabla. Si no pasas la clave, la elección sólo dura mientras la tabla está montada. La aplicación también puede controlar el estado con `columnOrder` / `onColumnOrderChange` y `columnVisibility` / `onColumnVisibilityChange`; `defaultColumnOrder` y `defaultColumnVisibility` definen los valores iniciales no controlados. Las columnas nuevas se añaden al final del orden guardado. La búsqueda global omite las columnas ocultas por el usuario.

Las acciones admiten `iconName`: `view`, `edit`, `delete`, `download`, `more`, `check` y `close`. También puedes pasar tu propio componente con `icon`. `iconOnly` oculta el texto visualmente, pero conserva el nombre accesible tomado de `label` o `ariaLabel`. `variant` acepta `default`, `primary` o `danger`; `iconPosition` acepta `start` o `end`. Los iconos integrados son SVG y no requieren una dependencia adicional.

## Vistas guardadas y compartibles

Quien usa la tabla puede guardar su configuración actual (búsqueda, filtros, orden, columnas visibles, orden y ancho de columnas, tabla o galería y vista de fotos) con un nombre, y compartirla con un enlace. No necesitas backend.

```jsx
<Table columns={columns} rows={rows} searchable sortable allowColumnCustomization
  allowLayoutChange viewsKey="catalogo-vistas" shareableViews />
```

- `viewsKey` muestra el menú «Vistas» para guardar, aplicar y eliminar vistas con nombre. Se guardan en `localStorage` bajo esa clave.
- `shareableViews` añade «Copiar enlace» y aplica la vista del enlace cuando la tabla se monta. El enlace solo cambia el parámetro `?view=` y conserva la ruta, los demás parámetros y el hash. Usa `shareableViews={{ param: 'v' }}` si hay dos tablas en la misma página.
- `syncViewToUrl` mantiene la vista en la dirección mientras se usa la tabla, con `history.replaceState` y sin añadir entradas al historial. Está apagado por defecto: si tu aplicación usa un router (React Router, Next) que reescribe la URL, prefiere `shareableViews` o controla la vista tú.

El enlace solo lleva el estado, no las filas. Con `manualFiltering`, `manualSorting` o `manualPagination`, al aplicar una vista la tabla llama `onSearchChange`, `onFiltersChange` y `onSortChange` para que pidas los datos de nuevo. La paginación y la selección no forman parte de la vista.

Una vista que no coincide con las columnas actuales se ajusta sola: se ignoran las columnas desconocidas, las nuevas aparecen al final y nunca se ocultan columnas con `hideable: false`. Un enlace inválido o de otra versión se ignora.

Si una prop individual está controlada (`sort`, `search`, `columnOrder`…), tiene prioridad sobre la vista; si además no tiene callback, aplicar una vista no la cambia.

Para guardar vistas en tu servidor, controla la vista y usa las funciones de codificación:

```jsx
import { Table, encodeView, decodeView } from '@isai_dev/data_table_lib';

const [view, setView] = useState(() => decodeView(savedText) ?? {});
<Table columns={columns} rows={rows} view={view}
  onViewChange={(next) => { setView(next); saveToServer(encodeView(next)); }} />
```

| Prop | Tipo | Uso |
| --- | --- | --- |
| `viewsKey` | `string` | Clave de `localStorage` para las vistas con nombre; muestra el menú «Vistas». |
| `shareableViews` | `boolean \| { param?: string }` | «Copiar enlace» y lectura del enlace al montar. |
| `syncViewToUrl` | `boolean` | Refleja la vista en la URL en vivo. |
| `view`, `onViewChange` | `TableView`, función | Vista controlada; `onViewChange` recibe la vista completa. |
| `defaultView` | `TableView` | Vista inicial no controlada. |

## Página de presentación

`npm run site` abre la página de presentación local. `npm run build:site` genera el sitio estático en `site-dist/`, separado de `dist/` para no incluirlo en el paquete npm. El workflow [Publish site](./.github/workflows/pages.yml) publica esa salida en GitHub Pages al cambiar el sitio, la librería o la documentación en `main`. La [documentación en la página](https://jazielisai.github.io/data_table_lib/?page=docs#instalar-y-ejecutar) muestra el README principal, el README de ejemplos y la guía de publicación directamente desde sus archivos Markdown. Tiene navegación lateral y presenta una sección a la vez. Los enlaces anteriores como `#instalar-y-ejecutar` siguen abriendo la sección correspondiente. La configuración de Pages del repositorio debe usar **GitHub Actions** como fuente de publicación.

Consulta la [guía de publicación](./docs/PUBLICACION.md) para activar Pages y entender la diferencia entre Releases, GitHub Packages y npmjs.com.

## Tabla con datos locales

Activa sólo las funciones que necesites. Las operaciones locales se aplican en este orden: **filtrar → ordenar → paginar**.

```jsx
const columns = [
  { field: 'name', headerName: 'Nombre', sortable: true, filterable: true },
  { field: 'email', headerName: 'Correo' },
  { field: 'internalId', hidden: true }
];
const rows = [
  { id: 1, name: 'Ana', email: 'ana@example.com', internalId: 'A1' },
  { id: 2, name: 'Luis', email: 'luis@example.com', internalId: 'B2' }
];

<Table
  caption="Personas"
  columns={columns}
  rows={rows}
  searchable
  paginationEnabled
  selectable
  actions={[{ label: 'Ver', onClick: (row) => console.log(row) }]}
/>;
```

`sortable` en la tabla habilita todas las columnas; `sortable: true` en una columna habilita sólo esa columna. `sortable: false` la excluye aunque la tabla lo tenga activo. `filterable: true` añade un filtro de texto a la columna. La búsqueda global revisa las columnas visibles, salvo las que declaran `searchable: false`.

Para selección controlada:

```jsx
const [selectedIds, setSelectedIds] = useState([]);
<Table
  columns={columns}
  rows={rows}
  selectable
  selectedRowIds={selectedIds}
  onSelectionChange={(ids, loadedRows) => setSelectedIds(ids)}
/>;
```

La casilla del encabezado selecciona o deselecciona **la página visible**. Los IDs seleccionados de otras páginas permanecen. `loadedRows` contiene únicamente las filas seleccionadas presentes en `rows`; para acciones entre páginas remotas, usa `ids`.

## Datos del servidor

Puedes controlar `sort`, `search`, `filters` y `pagination` desde React. Las opciones `manualSorting`, `manualFiltering` y `manualPagination` evitan que la librería vuelva a procesar filas que ya preparó el servidor. Usa `rowCount` para el total remoto.

```jsx
function RemotePeople() {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [sort, setSort] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(pagination.pageIndex + 1),
      pageSize: String(pagination.pageSize),
      search,
      name: filters.name ?? '',
      sortField: sort?.field ?? '',
      sortDirection: sort?.direction ?? ''
    });
    setLoading(true);
    setError('');
    fetch(`/api/people?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudieron cargar las personas');
        return response.json();
      })
      .then((data) => { setRows(data.rows); setRowCount(data.total); })
      .catch((cause) => { if (cause.name !== 'AbortError') setError(cause.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [pagination, sort, search, filters]);

  return <Table
    columns={[{ field: 'name', headerName: 'Nombre', sortable: true, filterable: true }]}
    rows={rows}
    rowCount={rowCount}
    loading={loading}
    error={error}
    searchable
    paginationEnabled
    manualSorting
    manualFiltering
    manualPagination
    sort={sort}
    onSortChange={setSort}
    search={search}
    onSearchChange={setSearch}
    filters={filters}
    onFiltersChange={setFilters}
    pagination={pagination}
    onPaginationChange={setPagination}
  />;
}
```

Los callbacks de búsqueda, filtros u ordenamiento solicitan volver a la primera página. Cuando `pagination` es controlada, proporciona `onPaginationChange` para aplicar ese cambio.

## Edición

`TableEdit` tiene dos modos:

- `editMode="immediate"` (predeterminado): cada columna editable llama a `onChange(event, row)`; la aplicación actualiza `rows`. Conserva el comportamiento original.
- `editMode="save"`: la tabla mantiene un borrador por fila; muestra **Guardar** y **Cancelar** tras un cambio. `validate(value, draftRow)` devuelve un mensaje de error o un valor vacío. `onSave(draft, originalRow)` puede ser asíncrono. La aplicación debe actualizar `rows` al guardar.

```jsx
function PeopleEditor() {
  const [rows, setRows] = useState([{ id: 1, name: 'Ana', role: 'admin' }]);
  const columns = [
    {
      field: 'name', headerName: 'Nombre', type: 'text',
      validate: (value) => String(value ?? '').trim()
        ? null : 'El nombre es obligatorio'
    },
    {
      field: 'role', headerName: 'Rol', type: 'select',
      options: [
        { value: 'admin', label: 'Administrador' },
        { value: 'viewer', label: 'Lector' }
      ]
    }
  ];
  const save = async (draft, original) => {
    // También puedes enviar draft a tu API aquí.
    setRows((current) => current.map((row) =>
      row.id === original.id ? draft : row));
  };
  return <TableEdit columns={columns} rows={rows}
    editMode="save" onSave={save} />;
}
```

Los tipos de celda incluyen `text`, `search`, `email`, `tel`, `url`, `password`, `textarea`, `date`, `time`, `datetime-local`, `number`, `range`, `color`, `file`, `select` y `button`. Para inputs de texto usa `placeholder` y `maxLength`; `textarea` admite `rows`; `number` y `range` admiten `min`, `max` y `step`; `file` admite `accept` y `multiple`. Los valores de inputs numéricos llegan como cadenas; conviértelos en tu callback si tu modelo necesita números. Para archivos, usa `event.target.files` en modo inmediato; en modo guardar, el borrador contiene el primer `File` o `null`, o un array de archivos con `multiple: true`. El input de archivo se limpia al cancelar o guardar.

### Casillas y opciones

`checkbox` y `switch` representan valores booleanos. `radio` selecciona una opción y `checkbox-group` guarda varias en un array. Ambos grupos usan `options: [{ value, label }]`. Funcionan como controles deshabilitados en `Table` y como controles editables en `TableEdit`. Si una columna de `TableEdit` debe permanecer fija, usa `editable: false`. Los botones de `type: 'button'` pueden usarse en ambas tablas con `onClick(event, row)`.

```jsx
const columns = [
  { field: 'approved', headerName: 'Aprobado', type: 'checkbox' },
  { field: 'alerts', headerName: 'Avisos', type: 'switch' },
  { field: 'role', headerName: 'Rol', type: 'radio',
    options: [{ value: 'reader', label: 'Lector' },
      { value: 'editor', label: 'Editor' }] },
  { field: 'channels', headerName: 'Canales', type: 'checkbox-group',
    options: [{ value: 'email', label: 'Correo' },
      { value: 'app', label: 'App' }] },
  { field: 'notes', headerName: 'Notas', type: 'textarea', rows: 3 }
];

<TableEdit columns={columns} rows={rows} editMode="save"
  onSave={(draft, original) => saveRow(draft, original)} />;
```

En modo inmediato, define `onValueChange(value, row, event)` en la columna y actualiza `rows` desde tu aplicación. Recibe un booleano para `checkbox`/`switch`, el valor de la opción para `radio`, un array para `checkbox-group` y una cadena para los inputs de texto y numéricos. `onValueChange` tiene prioridad sobre `onChange(event, row)`; este último conserva la API anterior. En modo guardar, `onSave` recibe el borrador completo y puedes validar cada campo con `validate(value, draftRow)`. La [demo de inputs](https://jazielisai.github.io/data_table_lib/#demo) permite alternar entre **Ver** y **Editar**.

`renderCell(value, row, rowIndex)` personaliza el contenido y tiene prioridad sobre `type`. Si implementas edición con `renderCell`, el control y sus cambios quedan a cargo de tu renderizador.

## Referencia de props

| Prop | Tipo | Uso |
| --- | --- | --- |
| `columns` | `TableColumn[]` | Definición y orden de columnas. `field` debe ser único. |
| `rows` | `Row[]` | Filas recibidas de la aplicación. |
| `getRowId` | `(row, index) => string \| number` | ID estable; por defecto `row.id` y luego índice. |
| `caption` | `ReactNode` | Título semántico de la tabla. |
| `actions` | `TableAction[]` | Botones por fila; `onClick(row, event)`. |
| `bulkActions` | `TableBulkAction[]` | Acciones de la selección; `onClick(loadedRows, selectedIds, event)`. |
| `searchable`, `search`, `onSearchChange` | `boolean`, `string`, función | Búsqueda global opcional/controlada. |
| `sortable`, `sort`, `onSortChange` | `boolean`, `{field, direction}`, función | Ordenamiento opcional/controlado. |
| `filters`, `onFiltersChange` | objeto, función | Filtros de columnas controlados. |
| `paginationEnabled`, `pagination`, `onPaginationChange` | `boolean`, `{pageIndex, pageSize}`, función | Paginación opcional/controlada; `pageIndex` empieza en 0. |
| `manualSorting`, `manualFiltering`, `manualPagination`, `rowCount` | booleanos, número | Operaciones delegadas al servidor. |
| `selectable`, `selectedRowIds`, `onSelectionChange` | `boolean`, IDs, función | Selección opcional/controlada. |
| `defaultImageView`, `imageView`, `onImageViewChange` | vista, vista, función | Vista de fotos inicial o controlada. |
| `allowImageViewChange` | `boolean` | Muestra el selector de vista a quien usa la tabla. |
| `defaultLayout`, `layout`, `onLayoutChange` | `'table' \| 'gallery'`, vista, función | Presentación inicial o controlada de `Table`. |
| `allowLayoutChange`, `layoutPreferencesKey` | `boolean`, `string` | Permite alternar vistas y recordar la elección. |
| `gallery` | `TableGalleryOptions` | Campos, proporción, tamaño y contenido adicional de las tarjetas. |
| `allowColumnCustomization` | `boolean` | Muestra el panel para ocultar y mover columnas. |
| `defaultColumnOrder`, `columnOrder`, `onColumnOrderChange` | `string[]`, `string[]`, función | Orden inicial o controlado de los campos. |
| `defaultColumnVisibility`, `columnVisibility`, `onColumnVisibilityChange` | objeto, objeto, función | Visibilidad inicial o controlada por campo; `false` oculta. |
| `columnPreferencesKey` | `string` | Guarda preferencias de columnas en `localStorage`. |
| `resizableColumns`, `columnWidths`, `defaultColumnWidths`, `onColumnWidthsChange` | booleano, mapa de anchos, mapa, función | Ajuste del ancho con puntero o flechas. `columnWidths` permite controlarlo desde la aplicación; la clave de preferencias guarda los anchos locales. |
| `pinActions` | `boolean` | Mantiene la columna de acciones pegada al borde derecho durante el desplazamiento horizontal. |
| `csvExport` | objeto | Muestra «Exportar CSV». Configura `filename`, `scope` (`filtered`, `page` o `selected`) y opcionalmente `onExport(rows, context)`. |
| `loading`, `error` | `boolean`, `ReactNode` | Estado de carga y aviso de error. |
| `emptyMessage`, `loadingMessage` | `ReactNode` | Textos de estado. |
| `className` | `string` | Clase adicional del contenedor. |

`TableEdit` también acepta `editMode`, `onSave`, `onCancel`, `saveLabel` y `cancelLabel`. Los textos de controles pueden adaptarse con `searchPlaceholder`, `actionsHeader`, `previousLabel`, `nextLabel` y `labels`:

```jsx
<Table labels={{
  search: 'Search table',
  filter: (header) => `Filter ${header}`,
  filterPlaceholder: 'Filter…',
  selectPage: 'Select page',
  selectRow: (id) => `Select row ${id}`,
  rowsPerPage: 'Rows per page',
  selectOption: 'Choose an option'
}} />
```

Cada columna acepta `field`, `headerName`, `hidden`, `hideable`, `reorderable`, `sortable`, `filterable`, `searchable`, `sortFn`, `filterFn`, `type`, `editable`, `options`, `placeholder`, `min`, `max`, `step`, `maxLength`, `rows`, `accept`, `multiple`, `renderCell`, `validate`, `onChange`, `onValueChange`, `onClick`, `label`, `icon`, `ariaLabel` y `style`. Para `type: 'image'`, también acepta `imageAlt`, `imageFit`, `imagePosition`, `imageFallback`, `previewable` y `onImageClick`. Cada acción acepta `id`, `label`, `icon`, `iconName`, `iconOnly`, `iconPosition`, `variant`, `ariaLabel`, `className`, `style`, `disabled` y `onClick`. Si sólo muestra un icono, proporciona un `label` de texto o `ariaLabel`.

Los nombres anteriores `getColumns`, `getRows`, `getButtons` y `onCaption` siguen disponibles. En `TableEdit`, `getButtons` conserva `onClick(event, row)`; el prop nuevo `actions` usa `onClick(row, event)`. Si pasas ambas versiones, prevalece el nombre nuevo.

### Anchos y exportación

Activa `resizableColumns` para arrastrar el separador del encabezado. También se puede enfocar y ajustar con las flechas izquierda y derecha (Mayús cambia 25 px). Cada columna admite `width`, `minWidth`, `maxWidth` y `resizable: false`. `columnPreferencesKey` conserva los anchos en el navegador; usa `columnWidths` y `onColumnWidthsChange` si tu aplicación administra ese estado. Puedes cambiar la etiqueta con `labels.resizeColumn`.

Usa `pinned: 'left'` o `pinned: 'right'` en una columna para mantenerla visible al desplazarse horizontalmente. `pinActions` fija las acciones a la derecha. Las columnas fijadas se agrupan en sus bordes; el panel de columnas sólo permite reordenarlas dentro de su grupo. Es recomendable definir `width` en esas columnas para que el desplazamiento sea predecible.

```jsx
<Table columns={columns} rows={rows} resizableColumns
  columnPreferencesKey="pedidos-columnas"
  csvExport={{ filename: 'pedidos.csv', scope: 'filtered' }} />
```

El CSV integrado contiene las columnas visibles, omite botones y protege los valores que una hoja de cálculo podría interpretar como fórmulas. `filtered` exporta las filas cargadas tras búsqueda, filtros y ordenamiento; `page` exporta sólo la página actual; `selected` exporta las filas cargadas que estén seleccionadas. Con operaciones delegadas al servidor, estos alcances sólo cubren las filas cargadas. Usa `onExport(rows, context)` para solicitar al servidor un archivo completo; el callback sustituye la descarga integrada. Puede devolver un `Blob` o `{ blob, filename }` para que la librería lo descargue automáticamente. Mientras espera, el botón muestra progreso y bloquea una segunda solicitud; si falla, se muestra un aviso. También puedes devolver `void` y gestionar la descarga desde tu aplicación. `toCsv(rows, columns)` está disponible como utilidad pública para construir el archivo.

## Diseño, accesibilidad y desarrollo

El estilo usa tipografía del sistema, separadores discretos, modo oscuro y foco visible. Sigue principios de las [Human Interface Guidelines para listas y tablas](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables), [color](https://developer.apple.com/design/human-interface-guidelines/color) y [accesibilidad](https://developer.apple.com/design/human-interface-guidelines/accessibility). Es una implementación web inspirada en esas pautas, no un componente oficial de Apple.

Los encabezados anuncian el estado de ordenamiento con `aria-sort`; controles y errores tienen etiquetas; la carga y los cambios de página se anuncian. Los botones, inputs y casillas funcionan con teclado. En pantallas estrechas, la tabla se desplaza horizontalmente. Usa IDs estables para que selección y borradores sobrevivan al ordenamiento y la paginación.

El CSS sólo usa clases `.dt-*`. Personaliza `--dt-surface`, `--dt-surface-hover`, `--dt-text`, `--dt-secondary`, `--dt-separator`, `--dt-accent` y `--dt-on-accent` en el contenedor. `npm run build` genera ESM, CommonJS, tipos y CSS en `dist/`. React es una dependencia par y no se incluye en el paquete.

La matriz de CI ejecuta pruebas con React 18 y 19 sobre Node 22, 24 y 26. Las dependencias de desarrollo se fijan a versiones exactas en `package-lock.json`; el paquete publicado sólo exige React y React DOM como dependencias par.
