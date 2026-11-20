import { useEffect, useState } from 'react';
import { Table, toCsv } from '@isai_dev/data_table_lib';
import { initialPeople } from './data.js';

// Simula la respuesta de una API. Reemplaza esta función por fetch('/api/people?...').
async function loadPeople({ search, filters, sort, pagination }) {
  await new Promise((resolve) => setTimeout(resolve, 250));
  let result = initialPeople.filter((row) =>
    [row.name, row.team, row.status].some((value) =>
      value.toLocaleLowerCase().includes(search.toLocaleLowerCase())) &&
    row.team.toLocaleLowerCase().includes((filters.team ?? '').toLocaleLowerCase()));
  if (sort) {
    const collator = new Intl.Collator('es', { sensitivity: 'base' });
    result = [...result].sort((a, b) => collator.compare(
      a[sort.field], b[sort.field]) * (sort.direction === 'desc' ? -1 : 1));
  }
  return {
    rows: result.slice(pagination.pageIndex * pagination.pageSize,
      (pagination.pageIndex + 1) * pagination.pageSize),
    total: result.length
  };
}

const columns = [
  { field: 'name', headerName: 'Nombre', sortable: true, pinned: 'left', width: 180 },
  { field: 'team', headerName: 'Equipo', sortable: true, filterable: true },
  { field: 'status', headerName: 'Estado' }
];

export default function RemoteExample() {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [sort, setSort] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    loadPeople({ search, filters, sort, pagination })
      .then((data) => {
        if (!active) return;
        setRows(data.rows);
        setRowCount(data.total);
      })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, filters, sort, pagination]);

  return <>
    <p>La consulta simulada prepara los datos; la tabla sólo muestra la página recibida. La exportación consulta todas las filas filtradas.</p>
    <Table columns={columns} rows={rows} rowCount={rowCount}
      caption="Datos remotos" loading={loading} error={error}
      resizableColumns
      csvExport={{ filename: 'personas-remotas.csv', onExport: async (_loadedRows, context) => {
        const all = await loadPeople({ ...context,
          pagination: { pageIndex: 0, pageSize: context.rowCount || 1 } });
        return new Blob([toCsv(all.rows, context.columns)], { type: 'text/csv;charset=utf-8' });
      } }}
      searchable paginationEnabled manualSorting manualFiltering manualPagination
      sort={sort} onSortChange={setSort}
      search={search} onSearchChange={setSearch}
      filters={filters} onFiltersChange={setFilters}
      pagination={pagination} onPaginationChange={setPagination} />
  </>;
}
