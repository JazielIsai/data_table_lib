import { useState } from 'react';
import { Table } from '@isai_dev/data_table_lib';
import { initialPeople } from './data.js';

const columns = [
  { field: 'name', headerName: 'Nombre', sortable: true, filterable: true, width: 190 },
  { field: 'team', headerName: 'Equipo', sortable: true },
  { field: 'status', headerName: 'Estado', pinned: 'right', width: 130 }
];

export default function BasicExample() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastOpened, setLastOpened] = useState('');

  return <>
    <p>Busca, filtra, ordena y selecciona filas. La paginación se hace en el navegador.</p>
    <Table columns={columns} rows={initialPeople} caption="Personas" searchable
      paginationEnabled selectable selectedRowIds={selectedIds}
      resizableColumns pinActions columnPreferencesKey="demo-personas-columnas"
      csvExport={{ filename: 'personas.csv', scope: 'filtered' }}
      onSelectionChange={setSelectedIds}
      actions={[{ label: 'Ver', onClick: (row) => setLastOpened(row.name) }]} />
    <p aria-live="polite">Seleccionadas: {selectedIds.length}
      {lastOpened && ` · Última fila abierta: ${lastOpened}`}</p>
  </>;
}
