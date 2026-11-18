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
    imageFit: 'cover', imageFallback: 'Sin foto' },
  { field: 'name', headerName: 'Nombre', sortable: true },
  { field: 'team', headerName: 'Equipo' }
];

export default function PhotoExample() {
  const [rows, setRows] = useState(people);
  const [imageView, setImageView] = useState('avatar');
  const [notice, setNotice] = useState('');

  return <>
    <p>El desarrollador inicia en avatares; cambia la vista en el control de la tabla.</p>
    <Table caption="Equipo con fotografías" columns={columns} rows={rows}
      imageView={imageView} onImageViewChange={setImageView} allowImageViewChange
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
