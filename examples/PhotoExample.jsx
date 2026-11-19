import { useState } from 'react';
import { Table } from '@isai_dev/data_table_lib';
import anaPhoto from './assets/ana.jpg';
import luisPhoto from './assets/luis.jpg';
import martaPhoto from './assets/marta.jpg';

const people = [
  { id: 1, name: 'Ana García', team: 'Diseño', photo: { src: anaPhoto, alt: 'Retrato de Ana García' } },
  { id: 2, name: 'Luis Torres', team: 'Desarrollo', photo: { src: luisPhoto, alt: 'Retrato de Luis Torres' } },
  { id: 3, name: 'Marta Ruiz', team: 'Producto', photo: { src: martaPhoto, alt: 'Retrato de Marta Ruiz' } }
];

const columns = [
  { field: 'photo', headerName: 'Foto', type: 'image', searchable: false,
    imageFit: 'cover', imageFallback: 'Sin foto', previewable: true },
  { field: 'name', headerName: 'Nombre', sortable: true, hideable: false },
  { field: 'team', headerName: 'Equipo' }
];

export default function PhotoExample() {
  const [rows, setRows] = useState(people);
  const [imageView, setImageView] = useState('avatar');
  const [notice, setNotice] = useState('');

  return <>
    <p>Cambia la vista, organiza las columnas y pulsa una foto para ampliarla. Tus columnas se guardan en este navegador.</p>
    <Table caption="Equipo con fotografías" columns={columns} rows={rows}
      imageView={imageView} onImageViewChange={setImageView} allowImageViewChange
      allowColumnCustomization columnPreferencesKey="dt-demo-photos-v2"
      actions={[
        { id: 'view', label: 'Ver', iconName: 'view', iconOnly: true, variant: 'primary',
          onClick: (row) => setNotice(`${row.name} trabaja en ${row.team}.`) },
        { id: 'remove', label: 'Quitar', iconName: 'delete', iconOnly: true, variant: 'danger',
          onClick: (row) => {
            setRows((current) => current.filter((item) => item.id !== row.id));
            setNotice(`${row.name} se quitó de este ejemplo.`);
          } }
      ]} />
    <div className="example-feedback">
      <p role="status">{notice || `Vista actual: ${imageView}`}</p>
      {rows.length < people.length && <button type="button" className="dt-button"
        onClick={() => { setRows(people); setNotice('Ejemplo restablecido.'); }}>
        Restablecer filas
      </button>}
    </div>
  </>;
}
