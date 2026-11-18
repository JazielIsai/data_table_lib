import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { filterRows, sortRows, paginateRows } from '../src/rowModel.js';
import { Table as TableEsm, TableEdit as TableEditEsm } from '../dist/index.js';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/'
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Node = dom.window.Node;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { render, screen, fireEvent, waitFor, cleanup } =
  await import('@testing-library/react');
afterEach(cleanup);

const require = createRequire(import.meta.url);
const { Table, TableEdit } = require('../dist/index.cjs');

test('exports ESM and CommonJS components', () => {
  for (const component of [TableEsm, TableEditEsm, Table, TableEdit]) {
    assert.equal(typeof component, 'function');
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
