import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { JSDOM } from 'jsdom';
import { Table, TableEdit } from '../dist/index.js';

const dom = new JSDOM('<!doctype html><html lang="es"><body></body></html>', {
  url: 'http://localhost/'
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.Element = dom.window.Element;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Document = dom.window.Document;
dom.window.HTMLCanvasElement.prototype.getContext = () => null;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { render, cleanup } = await import('@testing-library/react');
const axe = (await import('axe-core')).default;
afterEach(cleanup);

async function audit(element) {
  const { container } = render(element);
  const result = await axe.run(container, {
    rules: {
      // jsdom has no layout or reliable computed colors.
      'color-contrast': { enabled: false },
      'region': { enabled: false }
    }
  });
  assert.deepEqual(result.violations.map(({ id, nodes }) => ({ id,
    targets: nodes.map((node) => node.target) })), []);
}

test('table and gallery controls have accessible names and valid ARIA', async () => {
  const columns = [
    { field: 'photo', headerName: 'Foto', type: 'image', previewable: true },
    { field: 'name', headerName: 'Nombre', sortable: true, filterable: true }
  ];
  const rows = [{ id: 1, name: 'Ana', photo: { src: '/ana.jpg', alt: 'Retrato de Ana' } }];
  await audit(React.createElement(Table, { columns, rows, caption: 'Personas', searchable: true,
    selectable: true, actions: [{ label: 'Ver', iconName: 'view', iconOnly: true,
      onClick: () => {} }] }));
  cleanup();
  await audit(React.createElement(Table, { columns, rows, caption: 'Galería de personas',
    defaultLayout: 'gallery', selectable: true }));
});

test('editable controls expose names and error relationships', async () => {
  await audit(React.createElement(TableEdit, {
    caption: 'Edición de personas',
    columns: [
      { field: 'name', headerName: 'Nombre', type: 'text' },
      { field: 'approved', headerName: 'Aprobado', type: 'checkbox' },
      { field: 'role', headerName: 'Rol', type: 'radio',
        options: [{ value: 'reader', label: 'Lector' }, { value: 'editor', label: 'Editor' }] }
    ],
    rows: [{ id: 1, name: 'Ana', approved: true, role: 'editor' }],
    editMode: 'save', onSave: () => {}
  }));
});
