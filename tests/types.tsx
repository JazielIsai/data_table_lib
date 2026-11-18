import { Table, TableEdit, type TableColumn, type TableSort } from '@isai_dev/data_table_lib';

interface Person { id: number; name: string; role: string; photo?: { src: string; alt: string } }
const people: Person[] = [{ id: 1, name: 'Ana', role: 'admin',
  photo: { src: '/ana.jpg', alt: 'Ana' } }];
const columns: TableColumn<Person>[] = [
  { field: 'photo', headerName: 'Photo', type: 'image', imageFit: 'cover',
    imageAlt: (_value, row) => `Photo of ${row.name}` },
  { field: 'name', headerName: 'Name', sortable: true, filterable: true,
    type: 'text', validate: (value) => value ? null : 'Required' },
  { field: 'role', headerName: 'Role', type: 'select',
    options: [{ value: 'admin', label: 'Administrator' }] }
];
const sort: TableSort = { field: 'name', direction: 'asc' };

export const examples = <>
  <Table columns={columns} rows={people} sortable searchable paginationEnabled
    sort={sort} onSortChange={(next) => { next.direction; }}
    defaultImageView="avatar" allowImageViewChange
    onImageViewChange={(view) => { const presentation: 'avatar' | 'thumbnail' | 'large' | 'hidden' = view; void presentation; }}
    actions={[{ label: 'View', iconName: 'view', iconOnly: true, variant: 'primary',
      onClick: (row) => { row.name; } }]}
    selectable onSelectionChange={(ids, loaded) => {
      ids.map(String);
      loaded[0]?.name;
    }} />
  <TableEdit columns={columns} rows={people} editMode="save"
    onSave={async (draft, original) => { draft.name; original.id; }} />
</>;
