import { Table, TableEdit, type TableColumn, type TableSort } from 'data_table_lib';

interface Person { id: number; name: string; role: string }
const people: Person[] = [{ id: 1, name: 'Ana', role: 'admin' }];
const columns: TableColumn<Person>[] = [
  { field: 'name', headerName: 'Name', sortable: true, filterable: true,
    type: 'text', validate: (value) => value ? null : 'Required' },
  { field: 'role', headerName: 'Role', type: 'select',
    options: [{ value: 'admin', label: 'Administrator' }] }
];
const sort: TableSort = { field: 'name', direction: 'asc' };

export const examples = <>
  <Table columns={columns} rows={people} sortable searchable paginationEnabled
    sort={sort} onSortChange={(next) => { next.direction; }}
    selectable onSelectionChange={(ids, loaded) => {
      ids.map(String);
      loaded[0]?.name;
    }} />
  <TableEdit columns={columns} rows={people} editMode="save"
    onSave={async (draft, original) => { draft.name; original.id; }} />
</>;
