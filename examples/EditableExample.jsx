import { useState } from 'react';
import { TableEdit } from '@isai_dev/data_table_lib';
import { initialPeople } from './data.js';

const columns = [
  {
    field: 'name', headerName: 'Nombre', type: 'text',
    validate: (value) => String(value ?? '').trim().length >= 2
      ? null : 'Escribe al menos dos caracteres'
  },
  {
    field: 'team', headerName: 'Equipo', type: 'select',
    options: ['Diseño', 'Desarrollo', 'Producto'].map((value) => ({ value, label: value }))
  },
  { field: 'status', headerName: 'Estado' }
];

export default function EditableExample() {
  const [rows, setRows] = useState(initialPeople.slice(0, 3));
  const [message, setMessage] = useState('');

  const save = async (draft, original) => {
    // Sustituye esta actualización local por una petición a tu API.
    setRows((current) => current.map((row) =>
      row.id === original.id ? draft : row));
    setMessage(`Se guardó ${draft.name}`);
  };

  return <>
    <p>Modifica una celda. Cada fila conserva un borrador hasta Guardar o Cancelar.</p>
    <TableEdit columns={columns} rows={rows} caption="Editar personas"
      editMode="save" onSave={save} />
    <p aria-live="polite">{message}</p>
  </>;
}
