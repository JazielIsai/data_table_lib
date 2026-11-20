import { useState } from 'react';
import { Table } from '@isai_dev/data_table_lib';
import camera from './assets/camera.svg';
import headphones from './assets/headphones.svg';
import lamp from './assets/lamp.svg';

const products = [
  { id: 'CAM-01', name: 'Cámara compacta', category: 'Fotografía', price: 2499,
    stock: 12, photo: { src: camera, alt: 'Cámara compacta azul' } },
  { id: 'AUD-02', name: 'Audífonos inalámbricos', category: 'Audio', price: 1399,
    stock: 28, photo: { src: headphones, alt: 'Audífonos inalámbricos verdes' } },
  { id: 'LAM-03', name: 'Lámpara de escritorio', category: 'Hogar', price: 899,
    stock: 7, photo: { src: lamp, alt: 'Lámpara de escritorio naranja' } }
];

const columns = [
  { field: 'photo', headerName: 'Foto', type: 'image', previewable: true, searchable: false },
  { field: 'name', headerName: 'Producto', sortable: true, pinned: 'left', width: 190 },
  { field: 'category', headerName: 'Categoría', filterable: true },
  { field: 'price', headerName: 'Precio', sortable: true,
    renderCell: (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value) },
  { field: 'stock', headerName: 'Inventario', sortable: true }
];

export default function ProductExample() {
  const [notice, setNotice] = useState('');

  return <>
    <Table caption="Catálogo de productos" columns={columns} rows={products}
      defaultLayout="gallery" allowLayoutChange
      gallery={{ imageField: 'photo', titleField: 'name', descriptionField: 'category',
        aspectRatio: 'landscape', renderDetails: (row) =>
          <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(row.price)} · {row.stock} disponibles</span> }}
      searchable sortable resizableColumns
      csvExport={{ filename: 'catalogo.csv', scope: 'filtered' }}
      actions={[{ label: 'Detalles', iconName: 'view', onClick: (row) =>
        setNotice(`${row.name}: ${row.stock} unidades disponibles.`) }]} />
    <p role="status" className="example-feedback">{notice || 'Selecciona un producto para ver sus detalles.'}</p>
  </>;
}
