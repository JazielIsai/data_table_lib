import { useState } from 'react';
import { Table } from '@isai_dev/data_table_lib';
import anaPhoto from './assets/ana.jpg';
import luisPhoto from './assets/luis.jpg';
import martaPhoto from './assets/marta.jpg';
import sofiaPhoto from './assets/sofia-portrait.jpg';
import diegoPhoto from './assets/diego-landscape.jpg';

const people = [
  { id: 1, name: 'Ana García', team: 'Diseño', photo: { src: anaPhoto, alt: 'Retrato de Ana García', width: 512, height: 512 } },
  { id: 2, name: 'Luis Torres', team: 'Desarrollo', photo: { src: luisPhoto, alt: 'Retrato de Luis Torres', width: 512, height: 512 } },
  { id: 3, name: 'Marta Ruiz', team: 'Producto', photo: { src: martaPhoto, alt: 'Retrato de Marta Ruiz', width: 512, height: 512 } },
  { id: 4, name: 'Sofía Vega', team: 'Investigación', photo: { src: sofiaPhoto, alt: 'Retrato vertical de Sofía Vega', width: 1024, height: 1536 } },
  { id: 5, name: 'Diego Ríos', team: 'Ingeniería', photo: { src: diegoPhoto, alt: 'Retrato horizontal de Diego Ríos en su espacio de trabajo', width: 1536, height: 1024 } }
];

const columns = [
  { field: 'photo', headerName: 'Foto', type: 'image', searchable: false,
    imageFit: 'cover', imageFallback: 'Sin foto', previewable: true },
  { field: 'name', headerName: 'Nombre', sortable: true, hideable: false },
  { field: 'team', headerName: 'Equipo', filterable: true }
];

export default function PhotoExample() {
  const [rows, setRows] = useState(people);
  const [imageView, setImageView] = useState('avatar');
  const [selected, setSelected] = useState([]);
  const [notice, setNotice] = useState('');

  return <>
    <p>Compara fotos cuadradas, verticales y horizontales sin recortes. Ordena, filtra y selecciona perfiles, o cambia a tabla para comparar columnas.</p>
    <Table caption="Equipo con fotografías" columns={columns} rows={rows} searchable
      defaultLayout="gallery" allowLayoutChange
      layoutPreferencesKey="dt-demo-layout-v2"
      gallery={{ imageField: 'photo', titleField: 'name', descriptionField: 'team',
        renderDetails: (row) => `Perfil #${row.id}` }}
      imageView={imageView} onImageViewChange={setImageView} allowImageViewChange
      allowColumnCustomization columnPreferencesKey="dt-demo-photos-v2"
      selectable selectedRowIds={selected} onSelectionChange={setSelected}
      bulkActions={[{ label: 'Ver selección', iconName: 'view',
        onClick: (loaded, ids) => setNotice(
          `${ids.length} ${ids.length === 1 ? 'seleccionado' : 'seleccionados'}: ${loaded.map((row) => row.name).join(', ')}`) }]}
      actions={[
        { id: 'view', label: 'Ver', iconName: 'view', iconOnly: true, variant: 'primary',
          onClick: (row) => setNotice(`${row.name} trabaja en ${row.team}.`) },
        { id: 'remove', label: 'Quitar', iconName: 'delete', iconOnly: true, variant: 'danger',
          onClick: (row) => {
            setRows((current) => current.filter((item) => item.id !== row.id));
            setSelected((current) => current.filter((id) => id !== row.id));
            setNotice(`${row.name} se quitó de este ejemplo.`);
          } }
      ]} />
    <div className="example-feedback">
      <p role="status">{notice || `Vista actual: ${imageView}`}</p>
      {rows.length < people.length && <button type="button" className="dt-button"
        onClick={() => { setRows(people); setSelected([]); setNotice('Ejemplo restablecido.'); }}>
        Restablecer filas
      </button>}
    </div>
  </>;
}
