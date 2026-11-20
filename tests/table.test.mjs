import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { filterRows, sortRows, paginateRows } from '../src/rowModel.js';
import { toCsv } from '../src/csv.js';
import { decodeView, encodeView, loadSavedViews, normalizeView, readViewParam, saveSavedViews,
  upsertSavedView, withViewParam } from '../src/viewState.js';
import { Table as TableEsm, TableEdit as TableEditEsm, toCsv as toCsvEsm } from '../dist/index.js';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/'
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Node = dom.window.Node;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { render, screen, within, fireEvent, waitFor, cleanup } =
  await import('@testing-library/react');
afterEach(cleanup);

const require = createRequire(import.meta.url);
const { Table, TableEdit, toCsv: toCsvCjs } = require('../dist/index.cjs');

test('exports ESM and CommonJS components', () => {
  for (const component of [TableEsm, TableEditEsm, Table, TableEdit]) {
    assert.equal(typeof component, 'function');
  }
  assert.equal(toCsvEsm([{ name: 'Ana' }], [{ field: 'name' }]),
    toCsvCjs([{ name: 'Ana' }], [{ field: 'name' }]));
});

test('CSV escapes quotes, newlines and spreadsheet formulas', () => {
  const csv = toCsv([{ name: '=SUM(1,2)', note: 'A "quote"\nand more' }],
    [{ field: 'name', headerName: 'Name' }, { field: 'note', headerName: 'Note' }]);
  assert.equal(csv, '\uFEFF"Name","Note"\r\n"\'=SUM(1,2)","A ""quote""\nand more"\r\n');
});

test('column width supports keyboard, controlled state and local preferences', () => {
  const columns = [{ field: 'name', headerName: 'Nombre', width: 150, minWidth: 100, maxWidth: 200 }];
  const changes = [];
  const props = { columns, rows: [{ id: 1, name: 'Ana' }], resizableColumns: true,
    columnWidths: { name: 150 }, onColumnWidthsChange: (widths) => changes.push(widths) };
  const { rerender, unmount } = render(React.createElement(Table, props));
  const handle = screen.getByRole('separator', { name: 'Cambiar ancho de Nombre' });
  fireEvent.keyDown(handle, { key: 'ArrowRight', shiftKey: true });
  assert.deepEqual(changes, [{ name: 175 }]);
  rerender(React.createElement(Table, { ...props, columnWidths: changes[0] }));
  assert.equal(screen.getByRole('separator').getAttribute('aria-valuenow'), '175');
  unmount();
  render(React.createElement(Table, { columns, rows: [{ id: 1, name: 'Ana' }],
    resizableColumns: true, columnPreferencesKey: 'test-widths' }));
  fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowRight' });
  assert.equal(screen.getByRole('separator').getAttribute('aria-valuenow'), '160');
  cleanup();
  render(React.createElement(Table, { columns, rows: [{ id: 1, name: 'Ana' }],
    resizableColumns: true, columnPreferencesKey: 'test-widths' }));
  assert.equal(screen.getByRole('separator').getAttribute('aria-valuenow'), '160');
  window.localStorage.removeItem('test-widths');
});

test('dragging a column edge commits a clamped width', () => {
  const changes = [];
  render(React.createElement(Table, {
    columns: [{ field: 'name', headerName: 'Nombre', minWidth: 100, maxWidth: 210 }],
    rows: [{ id: 1, name: 'Ana' }], resizableColumns: true,
    onColumnWidthsChange: (widths) => changes.push(widths)
  }));
  const handle = screen.getByRole('separator');
  handle.parentElement.getBoundingClientRect = () => ({ width: 160 });
  fireEvent.pointerDown(handle, { button: 0, clientX: 20 });
  fireEvent.pointerMove(window, { clientX: 100 });
  fireEvent.pointerUp(window);
  assert.deepEqual(changes, [{ name: 210 }]);
  assert.equal(handle.getAttribute('aria-valuenow'), '210');
});

test('CSV export scopes filtered rows and delegates remote export', async () => {
  const calls = [];
  render(React.createElement(Table, {
    columns: [{ field: 'name', headerName: 'Nombre' }],
    rows: [{ id: 1, name: 'Ana' }, { id: 2, name: 'Luis' }],
    searchable: true, csvExport: { filename: 'personas.csv',
      onExport: (rows, context) => calls.push({ rows, context }) }
  }));
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Ana' } });
  fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));
  assert.deepEqual(calls[0].rows.map((row) => row.name), ['Ana']);
  assert.equal(calls[0].context.scope, 'filtered');
  assert.equal(calls[0].context.columns[0].field, 'name');
  await waitFor(() => assert.ok(screen.getByRole('button', { name: 'Exportar CSV' })));
});

test('pinned columns stay at the edges with selection and actions', () => {
  render(React.createElement(Table, {
    columns: [
      { field: 'middle', headerName: 'Medio', width: 120 },
      { field: 'right', headerName: 'Derecha', pinned: 'right', width: 100 },
      { field: 'left', headerName: 'Izquierda', pinned: 'left', width: 150 }
    ],
    rows: [{ id: 1, middle: 'M', left: 'I', right: 'D' }],
    resizableColumns: true, selectable: true, pinActions: true,
    actions: [{ label: 'Ver' }]
  }));
  const headers = screen.getAllByRole('columnheader');
  assert.deepEqual(headers.map((header) => header.textContent), ['', 'Izquierda', 'Medio', 'Derecha', 'Acciones']);
  assert.equal(headers[1].style.left, '42px');
  assert.equal(headers[3].style.right, '160px');
  assert.equal(headers[4].style.right, '0px');
  fireEvent.keyDown(within(headers[1]).getByRole('separator'), { key: 'ArrowRight' });
  assert.equal(headers[1].style.left, '42px');
  assert.equal(screen.getByRole('cell', { name: 'I' }).style.left, '42px');
});

test('remote export reports progress and failures', async () => {
  let rejectExport;
  render(React.createElement(Table, {
    columns: [{ field: 'name' }], rows: [{ id: 1, name: 'Ana' }],
    csvExport: { onExport: () => new Promise((_resolve, reject) => { rejectExport = reject; }) }
  }));
  fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));
  assert.equal(screen.getByRole('button', { name: 'Exportando…' }).disabled, true);
  rejectExport(new Error('Servidor no disponible'));
  await waitFor(() => assert.equal(screen.getByRole('alert').textContent, 'Servidor no disponible'));
  assert.equal(screen.getByRole('button', { name: 'Exportar CSV' }).disabled, false);
});

test('remote export downloads a returned Blob with its chosen filename', async () => {
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  const originalClick = dom.window.HTMLAnchorElement.prototype.click;
  const downloads = [];
  URL.createObjectURL = () => 'blob:csv-test';
  URL.revokeObjectURL = () => {};
  dom.window.HTMLAnchorElement.prototype.click = function () {
    downloads.push({ href: this.href, filename: this.download });
  };
  try {
    render(React.createElement(Table, {
      columns: [{ field: 'name' }], rows: [{ id: 1, name: 'Ana' }],
      csvExport: { onExport: async () => ({ blob: new Blob(['name\nAna']), filename: 'servidor.csv' }) }
    }));
    fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));
    await waitFor(() => assert.equal(downloads.length, 1));
    assert.equal(downloads[0].filename, 'servidor.csv');
  } finally {
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    dom.window.HTMLAnchorElement.prototype.click = originalClick;
  }
});

test('image presentation can be configured and changed by the viewer', () => {
  const columns = [
    { field: 'photo', headerName: 'Foto', type: 'image', searchable: false },
    { field: 'name', headerName: 'Nombre' }
  ];
  const rows = [{ id: 1, name: 'Ana', photo: { src: '/ana.jpg', alt: 'Retrato de Ana' } }];
  const views = [];
  const props = { columns, rows, allowImageViewChange: true, onImageViewChange: (view) => views.push(view) };
  const { rerender } = render(React.createElement(Table, { ...props, imageView: 'avatar' }));
  assert.match(screen.getByRole('img', { name: 'Retrato de Ana' }).className, /dt-image-avatar/);
  fireEvent.change(screen.getByRole('combobox', { name: 'Vista de fotos' }),
    { target: { value: 'large' } });
  assert.deepEqual(views, ['large']);
  rerender(React.createElement(Table, { ...props, imageView: 'large' }));
  assert.match(screen.getByRole('img', { name: 'Retrato de Ana' }).className, /dt-image-large/);
  rerender(React.createElement(Table, { ...props, imageView: 'hidden' }));
  assert.equal(screen.queryByRole('img'), null);
  assert.equal(screen.queryByRole('columnheader', { name: 'Foto' }), null);
  assert.ok(screen.getByRole('combobox', { name: 'Vista de fotos' }));
});

test('missing images show a fallback and icon-only actions remain accessible', () => {
  let opened = '';
  render(React.createElement(Table, {
    columns: [{ field: 'photo', headerName: 'Foto', type: 'image' }],
    rows: [{ id: 1, name: 'Ana', photo: '/missing.jpg' }],
    actions: [{ label: 'Ver perfil', iconName: 'view', iconOnly: true,
      onClick: (row) => { opened = row.name; } }]
  }));
  fireEvent.error(screen.getByRole('img', { name: 'Foto de Ana' }));
  assert.ok(screen.getByText('Sin foto'));
  fireEvent.click(screen.getByRole('button', { name: 'Ver perfil' }));
  assert.equal(opened, 'Ana');
});

test('image columns search their alt text only when explicitly enabled', () => {
  const rows = [{ id: 1, name: 'Ana', photo: { src: '/ana.jpg', alt: 'Retrato de Ana' } }];
  const columns = [{ field: 'photo', type: 'image' }, { field: 'name' }];
  assert.equal(filterRows(rows, columns, 'retrato', {}).length, 0);
  assert.equal(filterRows(rows, [{ ...columns[0], searchable: true }, columns[1]], 'retrato', {}).length, 1);
  assert.equal(filterRows(rows, columns, '', { photo: 'retrato' }).length, 1);
});

test('viewer can reorder and hide columns while locked columns stay visible', () => {
  const columns = [
    { field: 'name', headerName: 'Nombre', hideable: false },
    { field: 'team', headerName: 'Equipo' },
    { field: 'status', headerName: 'Estado' }
  ];
  render(React.createElement(Table, {
    columns, rows: [{ id: 1, name: 'Ana', team: 'Diseño', status: 'Activa' }],
    allowColumnCustomization: true, searchable: true
  }));
  fireEvent.click(screen.getByText('Columnas', { selector: 'summary' }));
  fireEvent.click(screen.getByRole('button', { name: 'Mover Estado a la izquierda' }));
  assert.deepEqual(screen.getAllByRole('columnheader').map((header) => header.textContent),
    ['Nombre', 'Estado', 'Equipo']);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Equipo' }));
  assert.equal(screen.queryByRole('columnheader', { name: 'Equipo' }), null);
  assert.equal(screen.getByRole('checkbox', { name: 'Nombre' }).disabled, true);
  fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar en la tabla' }),
    { target: { value: 'Diseño' } });
  assert.ok(screen.getByText('No hay datos'));
  fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
  assert.deepEqual(screen.getAllByRole('columnheader').map((header) => header.textContent),
    ['Nombre', 'Equipo', 'Estado']);
});

test('permanently hidden columns do not appear in customization or block moving neighbors', () => {
  render(React.createElement(Table, {
    columns: [{ field: 'name', headerName: 'Nombre' },
      { field: 'secret', headerName: 'Secreto', hidden: true },
      { field: 'team', headerName: 'Equipo' }],
    rows: [{ id: 1, name: 'Ana', secret: 'privado', team: 'Diseño' }],
    allowColumnCustomization: true
  }));
  fireEvent.click(screen.getByText('Columnas', { selector: 'summary' }));
  assert.equal(screen.queryByRole('checkbox', { name: 'Secreto' }), null);
  assert.equal(screen.queryByRole('columnheader', { name: 'Secreto' }), null);
  fireEvent.click(screen.getByRole('button', { name: 'Mover Equipo a la izquierda' }));
  assert.deepEqual(screen.getAllByRole('columnheader').map((header) => header.textContent),
    ['Equipo', 'Nombre']);
});

test('column preferences are restored by storage key and new columns are appended', () => {
  window.localStorage.clear();
  const columns = [{ field: 'name', headerName: 'Nombre' },
    { field: 'team', headerName: 'Equipo' }];
  const props = { columns, rows: [{ id: 1, name: 'Ana', team: 'Diseño' }],
    allowColumnCustomization: true, columnPreferencesKey: 'test-columns' };
  const { unmount } = render(React.createElement(Table, props));
  fireEvent.click(screen.getByText('Columnas', { selector: 'summary' }));
  fireEvent.click(screen.getByRole('button', { name: 'Mover Equipo a la izquierda' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Nombre' }));
  unmount();
  render(React.createElement(Table, { ...props, columns: [...columns,
    { field: 'status', headerName: 'Estado' }] }));
  assert.deepEqual(screen.getAllByRole('columnheader').map((header) => header.textContent),
    ['Equipo', 'Estado']);
  window.localStorage.clear();
});

test('photo viewer opens a dialog, moves between images, and custom click overrides it', () => {
  const prototype = window.HTMLDialogElement.prototype;
  const originalShow = prototype.showModal;
  const originalClose = prototype.close;
  prototype.showModal = function () { this.open = true; };
  prototype.close = function () { this.open = false; this.dispatchEvent(new window.Event('close')); };
  try {
    const columns = [{ field: 'photo', headerName: 'Foto', type: 'image', previewable: true }];
    const rows = [{ id: 1, name: 'Ana', photo: { src: '/ana.jpg', alt: 'Retrato de Ana' } },
      { id: 2, name: 'Luis', photo: { src: '/luis.jpg', alt: 'Retrato de Luis' } }];
    const { unmount } = render(React.createElement(Table, { columns, rows }));
    fireEvent.click(screen.getByRole('button', { name: 'Ampliar Retrato de Ana' }));
    assert.ok(within(screen.getByRole('dialog')).getByRole('img', { name: 'Retrato de Ana' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente foto' }));
    assert.ok(within(screen.getByRole('dialog')).getByRole('img', { name: 'Retrato de Luis' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar foto' }));
    assert.equal(screen.queryByRole('dialog'), null);
    unmount();
    let clicked = '';
    render(React.createElement(Table, { rows, columns: [{ ...columns[0],
      onImageClick: (_value, row) => { clicked = row.name; } }] }));
    fireEvent.click(screen.getByRole('button', { name: 'Ampliar Retrato de Ana' }));
    assert.equal(clicked, 'Ana');
    assert.equal(screen.queryByRole('dialog'), null);
  } finally {
    prototype.showModal = originalShow;
    prototype.close = originalClose;
  }
});

test('gallery shares search, pagination, selection and row actions with the table', () => {
  const rows = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1, name: `Persona ${index + 1}`, team: 'Diseño',
    photo: { src: `/photo-${index + 1}.jpg`, alt: `Retrato ${index + 1}` }
  }));
  let opened = '';
  render(React.createElement(Table, {
    caption: 'Personas', rows,
    columns: [{ field: 'photo', type: 'image' }, { field: 'name', headerName: 'Nombre' },
      { field: 'team', headerName: 'Equipo' }],
    defaultLayout: 'gallery', allowLayoutChange: true,
    gallery: { imageField: 'photo', titleField: 'name', descriptionField: 'team' },
    searchable: true, paginationEnabled: true, selectable: true,
    actions: [{ label: 'Ver', onClick: (row) => { opened = row.name; } }]
  }));
  const gallery = screen.getByRole('region', { name: 'Personas' });
  assert.equal(within(gallery).getAllByRole('article').length, 10);
  assert.ok(within(gallery).getByRole('heading', { name: 'Persona 1' }));
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  assert.ok(within(gallery).getByRole('heading', { name: 'Persona 11' }));
  fireEvent.click(within(gallery).getByRole('checkbox', { name: 'Seleccionar fila 11' }));
  fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar en la tabla' }),
    { target: { value: 'Persona 2' } });
  assert.equal(within(gallery).getAllByRole('article').length, 1);
  fireEvent.click(within(gallery).getByRole('button', { name: 'Ver' }));
  assert.equal(opened, 'Persona 2');
  fireEvent.click(screen.getByRole('button', { name: 'Tabla' }));
  assert.ok(screen.getByRole('table', { name: 'Personas' }));
  fireEvent.click(screen.getByRole('button', { name: 'Galería' }));
  assert.ok(screen.getByRole('region', { name: 'Personas' }));
});

test('controlled gallery layout reports changes and respects the supplied view', () => {
  const changes = [];
  const props = {
    columns: [{ field: 'photo', type: 'image' }, { field: 'name' }],
    rows: [{ id: 1, name: 'Ana', photo: '/ana.jpg' }],
    layout: 'table', onLayoutChange: (value) => changes.push(value), allowLayoutChange: true
  };
  const { rerender } = render(React.createElement(Table, props));
  fireEvent.click(screen.getByRole('button', { name: 'Galería' }));
  assert.deepEqual(changes, ['gallery']);
  assert.ok(screen.getByRole('table'));
  rerender(React.createElement(Table, { ...props, layout: 'gallery' }));
  assert.ok(screen.getByRole('region', { name: 'Galería de fotos' }));
});

test('gallery sorting, filtering and bulk actions use the current rows', () => {
  const rows = [
    { id: 1, name: 'Ana', team: 'Diseño', photo: '/ana.jpg' },
    { id: 2, name: 'Luis', team: 'Desarrollo', photo: '/luis.jpg' },
    { id: 3, name: 'Marta', team: 'Diseño', photo: '/marta.jpg' }
  ];
  let received;
  render(React.createElement(Table, {
    rows, columns: [
      { field: 'photo', type: 'image' },
      { field: 'name', headerName: 'Nombre', sortable: true },
      { field: 'team', headerName: 'Equipo', filterable: true }
    ], defaultLayout: 'gallery', selectable: true,
    bulkActions: [{ label: 'Procesar', onClick: (loaded, ids) => {
      received = { loaded: loaded.map((row) => row.name), ids };
    } }]
  }));
  fireEvent.change(screen.getByRole('combobox', { name: 'Ordenar por' }),
    { target: { value: 'name' } });
  fireEvent.click(screen.getByRole('button', { name: 'Orden descendente' }));
  fireEvent.change(screen.getByRole('searchbox', { name: 'Filtrar Equipo' }),
    { target: { value: 'Diseño' } });
  assert.deepEqual(screen.getAllByRole('article').map((article) => article.getAttribute('aria-label')),
    ['Marta', 'Ana']);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Seleccionar página' }));
  assert.ok(screen.getByRole('toolbar', { name: 'Acciones de selección' }));
  fireEvent.click(screen.getByRole('button', { name: 'Procesar' }));
  assert.deepEqual(received, { loaded: ['Ana', 'Marta'], ids: [3, 1] });
  fireEvent.click(screen.getByRole('button', { name: 'Limpiar selección' }));
  assert.equal(screen.queryByRole('toolbar', { name: 'Acciones de selección' }), null);
  fireEvent.change(screen.getByRole('combobox', { name: 'Ordenar por' }),
    { target: { value: '' } });
  assert.deepEqual(screen.getAllByRole('article').map((article) => article.getAttribute('aria-label')),
    ['Ana', 'Marta']);
});

test('layout preference survives remounting', () => {
  window.localStorage.clear();
  const props = {
    columns: [{ field: 'photo', type: 'image' }, { field: 'name' }],
    rows: [{ id: 1, name: 'Ana', photo: '/ana.jpg' }],
    defaultLayout: 'gallery', allowLayoutChange: true,
    layoutPreferencesKey: 'test-layout'
  };
  const { unmount } = render(React.createElement(Table, props));
  fireEvent.click(screen.getByRole('button', { name: 'Tabla' }));
  unmount();
  render(React.createElement(Table, props));
  assert.ok(screen.getByRole('table'));
  assert.equal(screen.getByRole('button', { name: 'Tabla' }).getAttribute('aria-pressed'), 'true');
  window.localStorage.clear();
});

test('gallery card options and responsive image sources are rendered', () => {
  render(React.createElement(Table, {
    columns: [{ field: 'photo', type: 'image' }, { field: 'name' }],
    rows: [{ id: 1, name: 'Ana', photo: {
      src: '/ana-400.jpg', srcSet: '/ana-400.jpg 400w, /ana-800.jpg 800w',
      sizes: '(max-width: 600px) 90vw, 240px', width: 800, height: 600,
      alt: 'Retrato de Ana' } }],
    defaultLayout: 'gallery', gallery: {
      aspectRatio: 'portrait', cardSize: 'compact',
      renderDetails: (row) => `Perfil: ${row.name}`
    }
  }));
  const image = screen.getByRole('img', { name: 'Retrato de Ana' });
  assert.equal(image.getAttribute('srcset'), '/ana-400.jpg 400w, /ana-800.jpg 800w');
  assert.equal(image.getAttribute('sizes'), '(max-width: 600px) 90vw, 240px');
  assert.equal(image.getAttribute('width'), '800');
  assert.match(image.parentElement.className, /dt-gallery-media-portrait/);
  assert.match(screen.getByRole('list').className, /dt-gallery-grid-compact/);
  assert.ok(screen.getByText('Perfil: Ana'));
});

test('renders headers, data, empty state and legacy props', () => {
  const html = renderToStaticMarkup(React.createElement(Table, {
    getColumns: [{ field: 'name', headerName: 'Name' }, { field: 'secret', hidden: true }],
    getRows: [{ id: 1, name: 'Ana', secret: 'private' }],
    getButtons: [{ label: 'View', onClick: () => {} }],
    onCaption: 'People'
  }));
  assert.match(html, /<caption>People<\/caption>/);
  assert.match(html, /<th scope="col">Name<\/th>/);
  assert.match(html, /<td data-label="Name">Ana<\/td>/);
  assert.doesNotMatch(html, /private/);
  assert.match(html, /type="button"/);
  const empty = renderToStaticMarkup(React.createElement(Table, {
    columns: [{ field: 'a' }, { field: 'b' }], rows: [], emptyMessage: 'Nothing here'
  }));
  assert.match(empty, /colSpan="2">Nothing here/);
});

test('filters, sorts and paginates without mutating input', () => {
  const rows = [{ id: 1, name: 'Zoe', score: 0 },
    { id: 2, name: 'Ana', score: 12 }, { id: 3, name: 'Ana', score: null }];
  const columns = [{ field: 'name' }, { field: 'score' }];
  assert.deepEqual(filterRows(rows, columns, 'ana', {}).map((row) => row.id), [2, 3]);
  assert.deepEqual(filterRows(rows, columns, '', { score: '0' }).map((row) => row.id), [1]);
  assert.deepEqual(sortRows(rows, { field: 'score', direction: 'desc' }, columns)
    .map((row) => row.id), [2, 1, 3]);
  assert.deepEqual(paginateRows(rows, 1, 2).map((row) => row.id), [3]);
  assert.equal(rows[0].id, 1);
});

test('search, column filter, sorting and pagination work together', () => {
  const rows = Array.from({ length: 12 }, (_, index) =>
    ({ id: index + 1, name: `Person ${index + 1}`, city: index % 2 ? 'Lima' : 'México' }));
  render(React.createElement(Table, {
    columns: [{ field: 'name', headerName: 'Name', sortable: true, filterable: true },
      { field: 'city', headerName: 'City' }],
    rows, searchable: true, paginationEnabled: true
  }));
  assert.match(screen.getByText('1–10 de 12').textContent, /1–10 de 12/);
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  assert.ok(screen.getByText('Person 11'));
  fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar en la tabla' }),
    { target: { value: 'Person 2' } });
  assert.ok(screen.getByText('Person 2'));
  assert.ok(screen.getByText('1–1 de 1'));
  fireEvent.change(screen.getByRole('searchbox', { name: 'Filtrar Name' }),
    { target: { value: 'no match' } });
  assert.ok(screen.getByText('No hay datos'));
  fireEvent.change(screen.getByRole('searchbox', { name: 'Filtrar Name' }),
    { target: { value: '' } });
  fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar en la tabla' }),
    { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: /Name/ }));
  assert.equal(screen.getByRole('columnheader', { name: /Name/ }).getAttribute('aria-sort'), 'ascending');
  fireEvent.click(screen.getByRole('button', { name: /Name/ }));
  assert.equal(screen.getByRole('columnheader', { name: /Name/ }).getAttribute('aria-sort'), 'descending');
});

test('selection includes visible page and preserves ids across pages', () => {
  const rows = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, name: `Row ${index + 1}` }));
  const changes = [];
  render(React.createElement(Table, {
    columns: [{ field: 'name' }], rows, selectable: true, paginationEnabled: true,
    onSelectionChange: (ids) => changes.push(ids)
  }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Seleccionar página' }));
  assert.equal(changes.at(-1).length, 10);
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Seleccionar fila 11' }));
  assert.equal(changes.at(-1).length, 11);
  assert.ok(changes.at(-1).includes(1));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Seleccionar página' }));
  assert.equal(changes.at(-1).length, 12);
});

test('custom labels and row action callbacks remain accessible', () => {
  const row = { id: 7, name: 'Ana' };
  const received = [];
  render(React.createElement(Table, {
    columns: [{ field: 'name', filterable: true }],
    rows: [row], searchable: true, selectable: true,
    labels: { search: 'Search table', filter: (name) => `Filter ${name}`,
      selectPage: 'Select page', selectRow: (id) => `Select row ${id}` },
    actions: [{ label: 'Open', onClick: (item) => received.push(item) }]
  }));
  assert.ok(screen.getByRole('searchbox', { name: 'Search table' }));
  assert.ok(screen.getByRole('searchbox', { name: 'Filter name' }));
  assert.ok(screen.getByRole('checkbox', { name: 'Select page' }));
  assert.ok(screen.getByRole('checkbox', { name: 'Select row 7' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open' }));
  assert.equal(received[0], row);
});

test('legacy edit actions receive event before row', () => {
  const row = { id: 1, name: 'Ana' };
  const received = [];
  render(React.createElement(TableEdit, {
    getColumns: [{ field: 'name' }], getRows: [row],
    getButtons: [{ label: 'Legacy', onClick: (event, item) =>
      received.push([event.type, item]) }]
  }));
  fireEvent.click(screen.getByRole('button', { name: 'Legacy' }));
  assert.deepEqual(received[0], ['click', row]);
});

test('manual modes emit changes and leave server rows untouched', () => {
  const sortChanges = [];
  const pageChanges = [];
  render(React.createElement(Table, {
    columns: [{ field: 'name', sortable: true }],
    rows: [{ id: 11, name: 'Zoe' }, { id: 12, name: 'Ana' }],
    sortable: true, searchable: true,
    manualSorting: true, manualFiltering: true, manualPagination: true,
    pagination: { pageIndex: 1, pageSize: 10 }, rowCount: 30,
    onSortChange: (value) => sortChanges.push(value),
    onPaginationChange: (value) => pageChanges.push(value)
  }));
  fireEvent.click(screen.getByRole('button', { name: /name/i }));
  assert.deepEqual(sortChanges.at(-1), { field: 'name', direction: 'asc' });
  assert.ok(screen.getByText('Zoe'));
  fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar en la tabla' }),
    { target: { value: 'missing' } });
  assert.ok(screen.getByText('Zoe'));
  assert.deepEqual(pageChanges.at(-1), { pageIndex: 0, pageSize: 10 });
  assert.ok(screen.getByText('11–20 de 30'));
});

test('save mode validates, saves a draft and cancels changes', async () => {
  const saved = [];
  const cancelled = [];
  render(React.createElement(TableEdit, {
    columns: [{ field: 'name', headerName: 'Name', type: 'text',
      validate: (value) => String(value).length < 2 ? 'Too short' : null }],
    rows: [{ id: 1, name: 'Ana' }],
    editMode: 'save',
    onSave: async (draft) => saved.push(draft),
    onCancel: (row) => cancelled.push(row)
  }));
  const input = screen.getByRole('textbox', { name: 'Name' });
  fireEvent.change(input, { target: { value: 'A' } });
  assert.ok(screen.getByText('Too short'));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
  assert.equal(saved.length, 0);
  fireEvent.change(input, { target: { value: 'Alicia' } });
  assert.equal(screen.queryByText('Too short'), null);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
  await waitFor(() => assert.equal(saved.length, 1));
  assert.equal(saved[0].name, 'Alicia');
  await waitFor(() => assert.equal(screen.queryByRole('button', { name: 'Guardar' }), null));
  fireEvent.change(input, { target: { value: 'Otra' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  assert.equal(input.value, 'Ana');
  assert.equal(cancelled.length, 1);
});

test('failed saves keep the draft and show an error for retry', async () => {
  render(React.createElement(TableEdit, {
    columns: [{ field: 'name', type: 'text' }],
    rows: [{ id: 1, name: 'Ana' }],
    editMode: 'save',
    onSave: async () => { throw new Error('Network error'); }
  }));
  fireEvent.change(screen.getByRole('textbox', { name: 'name' }),
    { target: { value: 'Alicia' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
  await waitFor(() => assert.ok(screen.getByRole('alert').textContent.includes('Network error')));
  assert.equal(screen.getByRole('textbox', { name: 'name' }).value, 'Alicia');
  assert.ok(screen.getByRole('button', { name: 'Guardar' }));
});

test('loading and errors are announced', () => {
  render(React.createElement(Table, {
    columns: [{ field: 'name' }], rows: [{ id: 1, name: 'Ana' }],
    loading: true, error: 'Falló la carga'
  }));
  assert.ok(screen.getByRole('alert').textContent.includes('Falló'));
  assert.ok(screen.getByRole('status').textContent.includes('Cargando'));
  assert.equal(screen.queryByText('Ana'), null);
  assert.equal(screen.getByRole('table').getAttribute('aria-busy'), 'true');
});

test('views encode to url-safe text and decode back, including accents', () => {
  const view = { search: 'café ñandú 🎉', filters: { team: 'Ventas' },
    sort: { field: 'name', direction: 'desc' }, columnOrder: ['name', 'team'],
    columnVisibility: { team: false }, columnWidths: { name: 200 },
    layout: 'gallery', imageView: 'large' };
  const text = encodeView(view);
  assert.match(text, /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(decodeView(text), view);
  assert.equal(encodeView({ search: '', filters: {}, sort: null }), encodeView({}));
});

test('invalid or future view links decode to null', () => {
  for (const text of [undefined, '', '%%%', btoa('nope'), btoa('[1]'),
    btoa(JSON.stringify({ v: 2, search: 'x' }))]) assert.equal(decodeView(text), null);
});

test('views are normalized against the current columns', () => {
  const columns = [{ field: 'photo', type: 'image' },
    { field: 'name', hideable: false, sortable: true, maxWidth: 300 },
    { field: 'team', filterable: true }, { field: 'added' }];
  const view = normalizeView({ columnOrder: ['gone', 'team', 'name'],
    columnVisibility: { name: false, team: false, gone: false },
    columnWidths: { name: 9999, team: 'x', gone: 100 },
    sort: { field: 'team', direction: 'up' }, filters: { team: 'A', gone: 'B', name: 3 },
    layout: 'gallery', imageView: 'huge' }, columns, { sortable: false, galleryAvailable: false });
  assert.deepEqual(view.columnOrder, ['team', 'name', 'photo', 'added']);
  assert.deepEqual(view.columnVisibility, { team: false });
  assert.deepEqual(view.columnWidths, { name: 300 });
  assert.equal(view.sort, null);
  assert.deepEqual(view.filters, { team: 'A' });
  assert.equal(view.layout, 'table');
  assert.equal(view.imageView, undefined);
  assert.equal(normalizeView({ columnVisibility: { photo: false, team: false, added: false } },
    [{ field: 'photo' }, { field: 'team' }, { field: 'added' }],
    { sortable: true, galleryAvailable: true }).columnVisibility, undefined);
});

test('saved views survive bad storage and replace by name', () => {
  window.localStorage.setItem('v-bad', '{oops');
  assert.deepEqual(loadSavedViews('v-bad'), []);
  let views = upsertSavedView([], ' Ventas ', { search: 'a' });
  views = upsertSavedView(views, 'Ventas', { search: 'b' });
  assert.equal(views.length, 1);
  assert.equal(views[0].name, 'Ventas');
  assert.deepEqual(views[0].view, { search: 'b' });
  saveSavedViews('v-ok', views);
  assert.deepEqual(loadSavedViews('v-ok'), views);
  window.localStorage.removeItem('v-bad');
  window.localStorage.removeItem('v-ok');
});

test('view links keep other query params and the hash', () => {
  const href = withViewParam('http://x.test/app?tab=2#top', 'view', encodeView({ search: 'a' }));
  const url = new URL(href);
  assert.equal(url.searchParams.get('tab'), '2');
  assert.equal(url.hash, '#top');
  assert.deepEqual(readViewParam('view', href), { search: 'a' });
  assert.equal(withViewParam(href, 'view', null), 'http://x.test/app?tab=2#top');
  assert.equal(withViewParam(href, 'view', encodeView({})), 'http://x.test/app?tab=2#top');
});

const h = React.createElement;

test('a view link applies on mount and asks manual tables to refetch', () => {
  window.history.replaceState(null, '', '/?view=' + encodeView({ search: 'ana',
    filters: { team: 'Ventas' }, sort: { field: 'name', direction: 'desc' } }));
  const calls = [];
  render(h(Table, { columns: [{ field: 'name', sortable: true }, { field: 'team', filterable: true }],
    rows: [], searchable: true, shareableViews: true, manualFiltering: true, manualSorting: true,
    onSearchChange: (v) => calls.push(['search', v]),
    onFiltersChange: (v) => calls.push(['filters', v]),
    onSortChange: (v) => calls.push(['sort', v]) }));
  assert.equal(screen.getByRole('searchbox', { name: 'Buscar en la tabla' }).value, 'ana');
  assert.equal(screen.getByRole('searchbox', { name: 'Filtrar team' }).value, 'Ventas');
  assert.deepEqual(calls.sort(), [['filters', { team: 'Ventas' }], ['search', 'ana'],
    ['sort', { field: 'name', direction: 'desc' }]]);
  window.history.replaceState(null, '', '/');
});

test('individual controlled props win over views and read-only pieces are untouched', () => {
  window.history.replaceState(null, '', '/?view=' + encodeView({ sort: { field: 'name', direction: 'desc' } }));
  render(h(Table, { columns: [{ field: 'name', sortable: true }], rows: [{ name: 'b' }, { name: 'a' }],
    shareableViews: true, sort: { field: 'name', direction: 'asc' } }));
  assert.deepEqual(screen.getAllByRole('cell').map((c) => c.textContent), ['a', 'b']);
  window.history.replaceState(null, '', '/');
});

test('onViewChange receives the whole view; defaultView seeds state', () => {
  const seen = [];
  render(h(Table, { columns: [{ field: 'name' }, { field: 'team' }], rows: [], searchable: true,
    defaultView: { columnVisibility: { team: false } }, onViewChange: (v) => seen.push(v) }));
  assert.ok(!screen.queryByRole('columnheader', { name: 'team' }), 'team stays hidden');
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'x' } });
  assert.equal(seen.at(-1).search, 'x');
  assert.deepEqual(seen.at(-1).columnVisibility, { team: false });
});

test('a controlled view drives uncontrolled pieces', () => {
  render(h(Table, { columns: [{ field: 'name' }], rows: [], searchable: true,
    view: { search: 'luis' }, onViewChange: () => {} }));
  assert.equal(screen.getByRole('searchbox').value, 'luis');
});

test('without shareableViews the url view is ignored', () => {
  window.history.replaceState(null, '', '/?view=' + encodeView({ search: 'zzz' }));
  render(h(Table, { columns: [{ field: 'name' }], rows: [], searchable: true }));
  assert.equal(screen.getByRole('searchbox').value, '');
  window.history.replaceState(null, '', '/');
});

test('viewer saves, applies and deletes named views that persist', () => {
  const props = { columns: [{ field: 'name' }, { field: 'team' }], rows: [], searchable: true,
    viewsKey: 'views-test' };
  const { unmount } = render(h(Table, props));
  assert.equal(screen.getByRole('button', { name: 'Guardar vista' }).disabled, true);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ana' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Nombre de la vista' }), { target: { value: 'Ana' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar vista' }));
  unmount();
  render(h(Table, props));
  assert.equal(screen.getByRole('searchbox').value, '');
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar Ana' }));
  assert.equal(screen.getByRole('searchbox').value, 'ana');
  assert.equal(screen.getByRole('button', { name: 'Aplicar Ana' }).getAttribute('aria-current'), 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar Ana' }));
  assert.deepEqual(loadSavedViews('views-test'), []);
  window.localStorage.removeItem('views-test');
});

test('copy link writes the current view and falls back to a visible field', async () => {
  window.history.replaceState(null, '', '/app?tab=2');
  let copied;
  Object.defineProperty(navigator, 'clipboard', { configurable: true,
    value: { writeText: async (t) => { copied = t; } } });
  render(h(Table, { columns: [{ field: 'name' }], rows: [], searchable: true, shareableViews: true }));
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ana' } });
  fireEvent.click(screen.getByRole('button', { name: 'Copiar enlace' }));
  await screen.findByText('Enlace copiado');
  assert.equal(new URL(copied).searchParams.get('tab'), '2');
  assert.deepEqual(readViewParam('view', copied), { search: 'ana' });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  fireEvent.click(screen.getByRole('button', { name: 'Copiar enlace' }));
  assert.equal((await screen.findByRole('textbox', { name: 'Copia este enlace' })).value, copied);
  assert.equal(window.location.search, '?tab=2');
  window.history.replaceState(null, '', '/');
});

test('syncViewToUrl replaces the url after a pause and reapplies on popstate', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  window.history.replaceState(null, '', '/app?tab=2#top');
  const pushes = [];
  const originalPush = window.history.pushState;
  window.history.pushState = (...args) => pushes.push(args);
  const { unmount } = render(h(Table, { columns: [{ field: 'name' }], rows: [], searchable: true,
    syncViewToUrl: true }));
  const before = window.history.length;
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ana' } });
  assert.equal(readViewParam('view'), null);
  t.mock.timers.tick(300);
  assert.deepEqual(readViewParam('view'), { search: 'ana' });
  assert.equal(new URL(window.location.href).searchParams.get('tab'), '2');
  assert.equal(window.location.hash, '#top');
  assert.equal(window.history.length, before);
  assert.equal(pushes.length, 0);
  window.history.replaceState(null, '', '/app?view=' + encodeView({ search: 'luis' }));
  fireEvent(window, new window.PopStateEvent('popstate'));
  assert.equal(screen.getByRole('searchbox').value, 'luis');
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'pendiente' } });
  unmount();
  t.mock.timers.tick(300);
  assert.deepEqual(readViewParam('view'), { search: 'luis' });
  window.history.pushState = originalPush;
  window.history.replaceState(null, '', '/');
});
