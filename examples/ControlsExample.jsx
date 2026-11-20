import { useState } from 'react';
import { Table, TableEdit } from '@isai_dev/data_table_lib';

const initialRows = [
  { id: 1, name: 'Ana García', approved: true, alerts: false,
    role: 'editor', channels: ['email', 'app'], email: 'ana@example.com',
    phone: '+52 55 1234 5678', website: 'https://isai-dev.com',
    startDate: '2026-11-20', startTime: '09:30', priority: 7,
    color: '#0066cc', notes: 'Revisar cada viernes.' },
  { id: 2, name: 'Luis Torres', approved: false, alerts: true,
    role: 'reader', channels: ['app'], email: 'luis@example.com',
    phone: '+52 55 8765 4321', website: 'https://example.com',
    startDate: '2026-11-21', startTime: '14:00', priority: 4,
    color: '#27a477', notes: 'Enviar resumen mensual.' }
];

const choices = [
  { field: 'name', headerName: 'Persona', type: 'text', editable: false },
  { field: 'approved', headerName: 'Aprobado', type: 'checkbox' },
  { field: 'alerts', headerName: 'Avisos', type: 'switch' },
  { field: 'role', headerName: 'Rol', type: 'radio',
    options: [{ value: 'reader', label: 'Lector' }, { value: 'editor', label: 'Editor' }] },
  { field: 'channels', headerName: 'Canales', type: 'checkbox-group',
    options: [{ value: 'email', label: 'Correo' }, { value: 'app', label: 'App' },
      { value: 'sms', label: 'SMS' }] }
];

const details = [
  { field: 'name', headerName: 'Persona', type: 'text', editable: false },
  { field: 'email', headerName: 'Correo', type: 'email' },
  { field: 'phone', headerName: 'Teléfono', type: 'tel' },
  { field: 'website', headerName: 'Sitio', type: 'url' },
  { field: 'startDate', headerName: 'Fecha', type: 'date' },
  { field: 'startTime', headerName: 'Hora', type: 'time' },
  { field: 'priority', headerName: 'Prioridad', type: 'range', min: 0, max: 10, step: 1 },
  { field: 'color', headerName: 'Color', type: 'color' },
  { field: 'notes', headerName: 'Notas', type: 'textarea', rows: 2, maxLength: 200 }
];

export default function ControlsExample() {
  const [rows, setRows] = useState(initialRows);
  const [mode, setMode] = useState('edit');
  const [category, setCategory] = useState('choices');
  const [message, setMessage] = useState('');
  const columns = category === 'choices' ? choices : details;
  const props = { columns, rows, caption: category === 'choices' ? 'Opciones' : 'Datos de contacto' };

  const save = (draft, original) => {
    setRows((current) => current.map((row) => row.id === original.id ? draft : row));
    setMessage(`Se guardaron los cambios de ${draft.name}.`);
  };

  return <>
    <p>Elige el tipo de campo y alterna entre lectura y edición. En edición, Guarda o Cancela cada fila.</p>
    <div className="dt-actions example-toggle-group" role="group" aria-label="Tipos de campo">
      <button type="button" className="dt-button" aria-pressed={category === 'choices'}
        onClick={() => setCategory('choices')}>Opciones</button>
      <button type="button" className="dt-button" aria-pressed={category === 'details'}
        onClick={() => setCategory('details')}>Otros inputs</button>
    </div>
    <div className="dt-actions example-toggle-group" role="group" aria-label="Modo de la tabla">
      <button type="button" className="dt-button" aria-pressed={mode === 'view'}
        onClick={() => setMode('view')}>Ver</button>
      <button type="button" className="dt-button" aria-pressed={mode === 'edit'}
        onClick={() => setMode('edit')}>Editar</button>
    </div>
    {mode === 'edit'
      ? <TableEdit key={category} {...props} editMode="save" onSave={save} />
      : <Table {...props} />}
    <p role="status">{message}</p>
  </>;
}
