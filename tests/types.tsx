import { Table, TableEdit, toCsv, encodeView, decodeView, type TableColumn, type TableSort, type TableView } from '@isai_dev/data_table_lib';

interface Person { id: number; name: string; role: string; photo?: { src: string; alt: string } }
const people: Person[] = [{ id: 1, name: 'Ana', role: 'admin',
  photo: { src: '/ana.jpg', alt: 'Ana' } }];
const columns: TableColumn<Person>[] = [
  { field: 'photo', headerName: 'Photo', type: 'image', imageFit: 'cover',
    previewable: true, imageAlt: (_value, row) => `Photo of ${row.name}`,
    onImageClick: (_value, row) => { row.name; } },
  { field: 'name', headerName: 'Name', sortable: true, filterable: true, hideable: false,
    pinned: 'left', width: 180,
    type: 'text', validate: (value) => value ? null : 'Required' },
  { field: 'role', headerName: 'Role', type: 'select',
    options: [{ value: 'admin', label: 'Administrator' }] },
  { field: 'active', headerName: 'Active', type: 'switch',
    onValueChange: (value, row) => { Boolean(value); row.id; } },
  { field: 'tags', headerName: 'Permissions', type: 'checkbox-group',
    options: [{ value: 1, label: 'Read' }, { value: 2, label: 'Write' }] },
  { field: 'notes', headerName: 'Notes', type: 'textarea', rows: 4, maxLength: 200 },
  { field: 'email', headerName: 'Email', type: 'email', editable: false },
  { field: 'priority', headerName: 'Priority', type: 'range', min: 0, max: 10, step: 1 }
];
const sort: TableSort = { field: 'name', direction: 'asc' };

export const examples = <>
  <Table columns={columns} rows={people} locale="en"
    labels={{ range: (first, last, total) => `${first}-${last} / ${total}`,
      imageAlt: (name) => `Photo of ${name}` }}
    sortable searchable paginationEnabled
    resizableColumns defaultColumnWidths={{ name: 180 }}
    pinActions
    csvExport={{ filename: 'people.csv', scope: 'filtered',
      onExport: (rows, context) => new Blob([toCsv(rows, context.columns)]) }}
    sort={sort} onSortChange={(next) => { next?.direction; }}
    defaultImageView="avatar" allowImageViewChange
    defaultLayout="gallery" allowLayoutChange
    gallery={{ imageField: 'photo', titleField: 'name', descriptionField: 'role',
      aspectRatio: 'square', cardSize: 'compact',
      renderDetails: (row) => row.role }}
    layoutPreferencesKey="people-layout"
    onLayoutChange={(layout) => { const view: 'table' | 'gallery' = layout; void view; }}
    allowColumnCustomization columnPreferencesKey="people-table"
    defaultColumnOrder={['name', 'photo', 'role']}
    defaultColumnVisibility={{ role: false }}
    onColumnOrderChange={(order) => { order.map(String); }}
    onColumnVisibilityChange={(visibility) => { visibility.role; }}
    onImageViewChange={(view) => { const presentation: 'avatar' | 'thumbnail' | 'large' | 'hidden' = view; void presentation; }}
    actions={[{ label: 'View', iconName: 'view', iconOnly: true, variant: 'primary',
      onClick: (row) => { row.name; } }]}
    selectable onSelectionChange={(ids, loaded) => {
      ids.map(String);
      loaded[0]?.name;
    }} bulkActions={[{ label: 'Process', onClick: (loaded, ids) => {
      loaded[0]?.name;
      ids.map(String);
    } }]} />
  <TableEdit columns={columns} rows={people} locale="en" editMode="save"
    onSave={async (draft, original) => { draft.name; original.id; }} />
</>;

const sharedView: TableView = { search: 'Ana', sort, layout: 'gallery', imageView: 'large' };
const encodedView: string = encodeView(sharedView);
const decodedView: TableView | null = decodeView(encodedView);
decodedView?.columnWidths;
export const viewExamples = <>
  <Table columns={columns} rows={people} view={sharedView}
    onViewChange={(next: TableView) => { next.search; }} viewsKey="people-views"
    shareableViews={{ param: 'v' }} syncViewToUrl />
  <TableEdit columns={columns} rows={people} defaultView={{ search: 'Ana' }} shareableViews />
</>;
