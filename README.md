# Data Table Lib

Tablas React para mostrar, explorar, seleccionar y editar datos. Incluye `Table` y `TableEdit`, CSS independiente, tipos TypeScript y una demo.

Creada por [Jaziel Isaí](https://isai-dev.com).

## Instalar y ejecutar

Requiere React y React DOM 18 o 19 en la aplicación. Para desarrollar o compilar este repositorio se recomienda Node.js 22.12+ (también 24 o 26 LTS); [Vite 8 admite Node 20.19+ o 22.12+](https://vite.dev/guide/). El nombre para npm es `@isai_dev/data_table_lib`; hasta su primera publicación puedes generar un archivo instalable desde este repositorio.

```bash
npm install
npm start                 # demo local
npm test                  # compila y ejecuta las pruebas
npm pack                  # crea el archivo instalable .tgz
```

En otro proyecto, instala el archivo generado con `npm install /ruta/al/archivo.tgz`. Cuando el paquete esté publicado en npm, usa `npm install @isai_dev/data_table_lib`. Después carga el CSS:

```jsx
import { Table, TableEdit } from '@isai_dev/data_table_lib';
import '@isai_dev/data_table_lib/style.css';
```

## Ejemplos ejecutables

`npm run examples` compila la librería y sirve [tres ejemplos independientes](./examples/README.md) en `http://localhost:5173/examples/`: tabla local, edición con validación y consulta simulada del servidor. Cada ejemplo importa las entradas públicas del paquete, igual que una aplicación consumidora.

## Página de presentación

`npm run site` abre la página de presentación local. `npm run build:site` genera el sitio estático en `site-dist/`, separado de `dist/` para no incluirlo en el paquete npm. El workflow [Publish site](./.github/workflows/pages.yml) publica esa salida en GitHub Pages al cambiar el sitio o la librería en `main`. La configuración de Pages del repositorio debe usar **GitHub Actions** como fuente de publicación.

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

Los tipos de celda son `text`, `date`, `number`, `file`, `select` y `button`. Los valores de inputs llegan como cadenas, incluso con `type="number"`; conviértelos en tu callback si tu modelo necesita números. Para archivos, usa `event.target.files` en modo inmediato; en modo guardar, el borrador contiene el primer `File` o `null`. El input de archivo se limpia al cancelar o guardar.

`renderCell(value, row, rowIndex)` personaliza el contenido y tiene prioridad sobre `type`. Si implementas edición con `renderCell`, el control y sus cambios quedan a cargo de tu renderizador.

## Referencia de props

| Prop | Tipo | Uso |
| --- | --- | --- |
| `columns` | `TableColumn[]` | Definición y orden de columnas. `field` debe ser único. |
| `rows` | `Row[]` | Filas recibidas de la aplicación. |
| `getRowId` | `(row, index) => string \| number` | ID estable; por defecto `row.id` y luego índice. |
| `caption` | `ReactNode` | Título semántico de la tabla. |
| `actions` | `TableAction[]` | Botones por fila; `onClick(row, event)`. |
| `searchable`, `search`, `onSearchChange` | `boolean`, `string`, función | Búsqueda global opcional/controlada. |
| `sortable`, `sort`, `onSortChange` | `boolean`, `{field, direction}`, función | Ordenamiento opcional/controlado. |
| `filters`, `onFiltersChange` | objeto, función | Filtros de columnas controlados. |
| `paginationEnabled`, `pagination`, `onPaginationChange` | `boolean`, `{pageIndex, pageSize}`, función | Paginación opcional/controlada; `pageIndex` empieza en 0. |
| `manualSorting`, `manualFiltering`, `manualPagination`, `rowCount` | booleanos, número | Operaciones delegadas al servidor. |
| `selectable`, `selectedRowIds`, `onSelectionChange` | `boolean`, IDs, función | Selección opcional/controlada. |
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

Cada columna acepta `field`, `headerName`, `hidden`, `sortable`, `filterable`, `searchable`, `sortFn`, `filterFn`, `type`, `options`, `placeholder`, `renderCell`, `validate`, `onChange`, `onClick`, `label`, `icon`, `ariaLabel` y `style`. Cada acción acepta `id`, `label`, `icon`, `ariaLabel`, `className`, `style`, `disabled` y `onClick`. Si sólo muestra un icono, proporciona `ariaLabel`.

Los nombres anteriores `getColumns`, `getRows`, `getButtons` y `onCaption` siguen disponibles. En `TableEdit`, `getButtons` conserva `onClick(event, row)`; el prop nuevo `actions` usa `onClick(row, event)`. Si pasas ambas versiones, prevalece el nombre nuevo.

## Diseño, accesibilidad y desarrollo

El estilo usa tipografía del sistema, separadores discretos, modo oscuro y foco visible. Sigue principios de las [Human Interface Guidelines para listas y tablas](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables), [color](https://developer.apple.com/design/human-interface-guidelines/color) y [accesibilidad](https://developer.apple.com/design/human-interface-guidelines/accessibility). Es una implementación web inspirada en esas pautas, no un componente oficial de Apple.

Los encabezados anuncian el estado de ordenamiento con `aria-sort`; controles y errores tienen etiquetas; la carga y los cambios de página se anuncian. Los botones, inputs y casillas funcionan con teclado. En pantallas estrechas, la tabla se desplaza horizontalmente. Usa IDs estables para que selección y borradores sobrevivan al ordenamiento y la paginación.

El CSS sólo usa clases `.dt-*`. Personaliza `--dt-surface`, `--dt-surface-hover`, `--dt-text`, `--dt-secondary`, `--dt-separator`, `--dt-accent` y `--dt-on-accent` en el contenedor. `npm run build` genera ESM, CommonJS, tipos y CSS en `dist/`. React es una dependencia par y no se incluye en el paquete.

La matriz de CI ejecuta pruebas con React 18 y 19 sobre Node 22, 24 y 26. Las dependencias de desarrollo se fijan a versiones exactas en `package-lock.json`; el paquete publicado sólo exige React y React DOM como dependencias par.
