import { useState } from 'react';
import { Table, TableEdit } from './lib.js';

const people = ['Ana', 'Luis', 'Marta', 'Diego', 'Sofía', 'Pablo', 'Elena', 'Raúl',
  'Julia', 'Andrés', 'Lucía', 'Miguel', 'Valeria', 'Carlos', 'Isabel'];
const initialRows = people.map((name, index) => ({
  id: index + 1,
  name,
  role: ['Diseño', 'Desarrollo', 'Producto'][index % 3],
  active: index % 4 === 0 ? 'No' : 'Sí'
}));

export default function App() {
  const [rows, setRows] = useState(initialRows);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const columns = [
    { field: 'name', headerName: 'Nombre', type: 'text', sortable: true, filterable: true,
      validate: (value) => String(value ?? '').trim().length < 2 ? 'Escribe al menos 2 caracteres' : null },
    { field: 'role', headerName: 'Área', type: 'select', sortable: true,
      options: ['Diseño', 'Desarrollo', 'Producto'].map((value) => ({ value, label: value })) },
    { field: 'active', headerName: 'Activo', type: 'select', sortable: true,
      options: ['Sí', 'No'].map((value) => ({ value, label: value })) }
  ];
  const save = (draft) => setRows((current) => current.map((row) =>
    row.id === draft.id ? draft : row));

  return <main>
    <span className="eyebrow">React component library</span>
    <h1>Data Table Lib</h1>
    <p>Ordena, filtra, selecciona y edita filas. Las funciones también pueden conectarse a una API.</p>
    <section>
      <div className="demo-heading">
        <div>
          <h2>Explorar datos</h2>
          <p>Seleccionadas: {selectedIds.length}</p>
        </div>
        <div className="demo-actions">
          <button type="button" onClick={() => setLoading((value) => !value)}>Alternar carga</button>
          <button type="button" onClick={() => setShowError((value) => !value)}>Alternar error</button>
        </div>
      </div>
      <Table columns={columns} rows={rows} caption="Equipo" searchable sortable
        paginationEnabled selectable selectedRowIds={selectedIds}
        onSelectionChange={setSelectedIds} loading={loading}
        error={showError ? 'No se pudo actualizar. Puedes seguir viendo los datos cargados.' : null}
        actions={[{ label: 'Seleccionar', onClick: (row) => setSelected(row.name) }]} />
      {selected && <p aria-live="polite">Seleccionado: {selected}</p>}
    </section>
    <section>
      <h2>Editar datos</h2>
      <p>Modifica una celda y usa Guardar o Cancelar. El nombre debe tener al menos dos caracteres.</p>
      <TableEdit columns={columns} rows={rows.slice(0, 3)} caption="Editar equipo"
        editMode="save" onSave={save} />
    </section>
  </main>;
}
