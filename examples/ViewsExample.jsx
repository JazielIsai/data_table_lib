import { Table } from '@isai_dev/data_table_lib';
import anaPhoto from './assets/ana.jpg';
import luisPhoto from './assets/luis.jpg';
import martaPhoto from './assets/marta.jpg';
import { initialPeople } from './data.js';

const photos = {
  1: { src: anaPhoto, alt: 'Retrato de Ana' },
  2: { src: luisPhoto, alt: 'Retrato de Luis' },
  3: { src: martaPhoto, alt: 'Retrato de Marta' }
};
const people = initialPeople.map((person) => ({ ...person, photo: photos[person.id] ?? null }));

const columns = [
  { field: 'photo', headerName: 'Foto', type: 'image', searchable: false,
    imageFit: 'cover', imageFallback: 'Sin foto', previewable: true },
  { field: 'name', headerName: 'Nombre', sortable: true, hideable: false, width: 180 },
  { field: 'team', headerName: 'Equipo', sortable: true, filterable: true },
  { field: 'status', headerName: 'Estado', filterable: true }
];

export default function ViewsExample() {
  return <>
    <p>
      Busca, filtra, ordena, oculta columnas o cambia a galería. Después guarda la configuración
      con un nombre en «Vistas» o copia un enlace que la reproduce en otra pestaña.
    </p>
    <Table caption="Equipo con vistas guardadas" columns={columns} rows={people}
      searchable sortable resizableColumns allowColumnCustomization
      allowLayoutChange allowImageViewChange defaultImageView="avatar"
      gallery={{ imageField: 'photo', titleField: 'name', descriptionField: 'team' }}
      viewsKey="dt-demo-views" shareableViews />
  </>;
}
