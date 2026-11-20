# Vistas guardadas y compartibles — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que la tabla pueda guardar su configuración como vistas con nombre, compartirla con un enlace y, opcionalmente, reflejarla en vivo en la URL.

**Architecture:** La lógica pura (codificar, decodificar, normalizar, almacenamiento, URL) vive en `src/viewState.js`. `TableBase.jsx` construye la vista actual a partir de su estado y aplica vistas mediante los `change*` existentes. La UI está en `src/ViewMenu.jsx`.

**Tech Stack:** React 18/19, JS (JSX) con tipos en `src/index.d.ts`, pruebas con `node --test` + jsdom + Testing Library en `tests/table.test.mjs`.

**Spec:** `docs/superpowers/specs/2026-11-19-vistas-guardadas-design.md`

## Global Constraints

- Ningún cambio de comportamiento en props existentes; todas las pruebas actuales siguen pasando.
- Sin dependencias nuevas.
- La URL no se toca nunca si `syncViewToUrl` no está activo (solo se lee al montar con `shareableViews`).
- Parámetro de URL por defecto: `view`. Formato: base64url sin `=` de `JSON.stringify({ v: 1, ...vista })` en UTF-8.
- `syncViewToUrl` usa `history.replaceState`, con espera de 300 ms, y escucha `popstate`. Nunca `pushState`.
- La paginación y la selección no forman parte de la vista.
- Textos por defecto en español, todos sobrescribibles vía `labels`.
- Todo acceso a `window`, `localStorage`, `history` y `navigator.clipboard` va en try/catch y comprueba `typeof window`.
- Comando de verificación completo: `npm test` (compila, comprueba tipos y ejecuta pruebas).

## Review Focus

1. Enlace con columnas que ya no existen, o sin columnas nuevas → se aplica lo válido y las columnas nuevas aparecen al final (prueba en Task 1).
2. Enlace aplicado sobre una tabla con `sort` controlado sin `onSortChange` → no cambia el orden ni lanza error (Task 3).
3. `localStorage` con JSON corrupto bajo `viewsKey` → lista vacía, el menú sigue funcionando (Task 2).
4. URL con otros parámetros y un hash → «Copiar enlace» y `syncViewToUrl` los conservan (Tasks 2 y 5).
5. Al desmontar con `syncViewToUrl` activo y un cambio pendiente → no hay escritura tardía ni oyente de `popstate` colgado (Task 5).

---

### Task 1: Codificación y normalización de vistas

**Files:**
- Create: `src/viewState.js`
- Modify: `src/lib.js`, `src/index.d.ts`
- Test: `tests/table.test.mjs`

**Interfaces:**
- Produces:
  - `encodeView(view: TableView): string`: omite `search` vacío, `filters` vacíos o con valores vacíos, `sort` nulo y objetos vacíos.
  - `decodeView(text: string | null | undefined): TableView | null`: `null` si falta, no es base64url válido, no parsea, no es objeto o `v !== 1`. Devuelve la vista sin `v`.
  - `normalizeView(view: TableView | null, columns: TableColumn[], options: { sortable: boolean; galleryAvailable: boolean }): TableView`: aplica las reglas de la sección «Normalización» del spec. Usa `normalizeColumnOrder` de `columnState.js`, y para los anchos los límites `minWidth ?? 80` / `maxWidth ?? 800`.
  - `viewsEqual(a: TableView, b: TableView): boolean`: compara `encodeView` de ambas.
  - Tipos `TableView` y `TableSavedView` exportados en `index.d.ts`, con la forma exacta del spec. `encodeView` y `decodeView` se exportan desde `src/lib.js`, y sus declaraciones van en `index.d.ts`.

- [ ] **Step 1: Escribir las pruebas que fallan** (importa de `../src/viewState.js`)

```js
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
```

- [ ] **Step 2: Comprobar que fallan.** Ejecuta `npm run build && node --test --test-name-pattern="view" tests/table.test.mjs`. Deben fallar porque `viewState.js` no existe.
- [ ] **Step 3: Implementar las cuatro funciones en `src/viewState.js`.** Para UTF-8 ↔ base64url usa `TextEncoder`/`TextDecoder` + `btoa`/`atob`, reemplazando `+/` por `-_` y quitando `=`. Añade los exports y los tipos.
- [ ] **Step 4: Ejecutar `npm test`.** Esperado: todo PASS, incluida la comprobación de tipos.
- [ ] **Step 5: Commit** — `feat: encode, decode and normalize table views`

### Task 2: Vistas con nombre en localStorage y helpers de URL

**Files:**
- Modify: `src/viewState.js`
- Test: `tests/table.test.mjs`

**Interfaces:**
- Produces:
  - `loadSavedViews(key: string | undefined): TableSavedView[]`: devuelve `[]` si no hay clave, si el JSON es inválido o si no es un array. Filtra las entradas sin `id`/`name` string o sin `view` objeto.
  - `saveSavedViews(key: string | undefined, views: TableSavedView[]): void`
  - `upsertSavedView(views: TableSavedView[], name: string, view: TableView): TableSavedView[]`: recorta el nombre, reemplaza la vista si ya hay una con el mismo nombre (conserva su `id`) y si no la añade al final con un id nuevo (`crypto.randomUUID?.() ?? Date.now().toString(36)`) y `createdAt` ISO.
  - `readViewParam(param: string, href?: string): TableView | null`: por defecto `window.location.href`. Devuelve `decodeView(new URL(href).searchParams.get(param))`.
  - `withViewParam(href: string, param: string, encoded: string | null): string`: fija o elimina el parámetro y conserva el resto de la URL, incluido el hash. Si `encoded` es la codificación de una vista vacía, elimina el parámetro.

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
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
});

test('view links keep other query params and the hash', () => {
  const href = withViewParam('http://x.test/app?tab=2#top', 'view', encodeView({ search: 'a' }));
  const url = new URL(href);
  assert.equal(url.searchParams.get('tab'), '2');
  assert.equal(url.hash, '#top');
  assert.deepEqual(readViewParam('view', href), { search: 'a' });
  assert.equal(withViewParam(href, 'view', null), 'http://x.test/app?tab=2#top');
});
```

- [ ] **Step 2: Comprobar que fallan.** Ejecuta el mismo comando con `--test-name-pattern="saved views|view links"`. Esperado: FAIL.
- [ ] **Step 3: Implementar las cinco funciones.**
- [ ] **Step 4: Ejecutar `npm test`.** Esperado: PASS.
- [ ] **Step 5: Commit** — `feat: store named views and build view links`

### Task 3: Vista unificada en TableBase (props `view`, `defaultView`, `onViewChange`, lectura del enlace)

**Files:**
- Modify: `src/TableBase.jsx`, `src/index.d.ts` (en `BaseProps`: `view`, `defaultView`, `onViewChange`, `viewsKey`, `shareableViews`, `syncViewToUrl`)
- Test: `tests/table.test.mjs`, `tests/types.tsx`

**Interfaces:**
- Consumes: `normalizeView`, `readViewParam`, `viewsEqual` (Tasks 1 y 2).
- Produces, dentro de `DataTable`:
  - `currentView: TableView`: se construye con `search`, `filters`, `sort`, `columnOrder`, `columnVisibility`, `columnWidths`, `layout` e `imageView` efectivos.
  - `applyView(view: TableView): void`: normaliza la vista y, para cada campo presente cuyo valor difiera del actual, llama al `change*` correspondiente. Salta las piezas de solo lectura (controladas sin callback). Para los anchos reemplaza el objeto completo: añade `changeColumnWidths(next)` y haz que `changeColumnWidth` lo use. Para `layout`, `imageView`, columnas, búsqueda, filtros y orden reutiliza los `change*` existentes. `onViewChange` se llama una vez con la vista final, no una vez por campo.
  - `viewParam = typeof shareableViews === 'object' ? shareableViews.param ?? 'view' : 'view'`. `shareableViews` cuenta como activo si es verdadero o si `syncViewToUrl` está activo.
  - Vista inicial: en el inicializador de estado se calcula `normalizeView(urlView ?? defaultView)`, donde `urlView` es `readViewParam(viewParam)` cuando los enlaces están activos. Sus campos inicializan los estados locales (`localSearch`, `localFilters`, `localSort`, `localImageView`, `storedColumns`, `storedLayout`) **sin** escribir en `localStorage`. Si hay vista inicial (de enlace o `defaultView`), un efecto al montar llama a los callbacks `on*Change` de los campos que difieran de las props. Así los modos `manual*` vuelven a pedir los datos.
  - `view` controlada: los campos de `view` se usan cuando la prop individual es `undefined`, antes que el estado local. Precedencia: prop individual > `view` > estado local.
  - Cada cambio de un campo de la vista desde la UI llama `onViewChange(nextView)` con la vista completa resultante.

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
test('a view link applies on mount and asks manual tables to refetch', () => {
  window.history.replaceState(null, '', '/?view=' + encodeView({ search: 'ana',
    filters: { team: 'Ventas' }, sort: { field: 'name', direction: 'desc' } }));
  const calls = [];
  render(<Table columns={[{ field: 'name', sortable: true }, { field: 'team', filterable: true }]}
    rows={[]} searchable shareableViews manualFiltering manualSorting
    onSearchChange={(v) => calls.push(['search', v])}
    onFiltersChange={(v) => calls.push(['filters', v])}
    onSortChange={(v) => calls.push(['sort', v])} />);
  assert.equal(screen.getByRole('searchbox').value, 'ana');
  assert.deepEqual(calls.sort(), [['filters', { team: 'Ventas' }], ['search', 'ana'],
    ['sort', { field: 'name', direction: 'desc' }]]);
  window.history.replaceState(null, '', '/');
});

test('individual controlled props win over views and read-only pieces are untouched', () => {
  window.history.replaceState(null, '', '/?view=' + encodeView({ sort: { field: 'name', direction: 'desc' } }));
  render(<Table columns={[{ field: 'name', sortable: true }]} rows={[{ name: 'b' }, { name: 'a' }]}
    shareableViews sort={{ field: 'name', direction: 'asc' }} />);
  assert.deepEqual(screen.getAllByRole('cell').map((c) => c.textContent), ['a', 'b']);
  window.history.replaceState(null, '', '/');
});

test('onViewChange receives the whole view; defaultView seeds state', () => {
  const seen = [];
  render(<Table columns={[{ field: 'name' }, { field: 'team' }]} rows={[]} searchable
    defaultView={{ columnVisibility: { team: false } }} onViewChange={(v) => seen.push(v)} />);
  assert.equal(screen.queryByRole('columnheader', { name: 'team' }), null);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'x' } });
  assert.equal(seen.at(-1).search, 'x');
  assert.deepEqual(seen.at(-1).columnVisibility, { team: false });
});

test('without shareableViews the url view is ignored', () => {
  window.history.replaceState(null, '', '/?view=' + encodeView({ search: 'zzz' }));
  render(<Table columns={[{ field: 'name' }]} rows={[]} searchable />);
  assert.equal(screen.getByRole('searchbox').value, '');
  window.history.replaceState(null, '', '/');
});
```

En `tests/types.tsx` añade un uso tipado de `view`, `defaultView`, `onViewChange`, `viewsKey`, `shareableViews={{ param: 'v' }}` y `syncViewToUrl`.

- [ ] **Step 2: Comprobar que fallan.** Ejecuta `npm run build && node --test --test-name-pattern="view" tests/table.test.mjs`. Esperado: fallan las 4 pruebas nuevas.
- [ ] **Step 3: Implementar en `TableBase.jsx` y los tipos en `index.d.ts`.**
- [ ] **Step 4: Ejecutar `npm test`.** Esperado: todo PASS, incluidas las pruebas anteriores.
- [ ] **Step 5: Commit** — `feat: unify table state into a view and read shared links`

### Task 4: Menú «Vistas» y «Copiar enlace»

**Files:**
- Create: `src/ViewMenu.jsx`
- Modify: `src/TableBase.jsx` (barra de herramientas y `words`), `src/table.css`, `src/index.d.ts` (`TableLabels`)
- Test: `tests/table.test.mjs`

**Interfaces:**
- Consumes: `currentView`, `applyView`, `viewParam` (Task 3); `loadSavedViews`, `saveSavedViews`, `upsertSavedView`, `withViewParam`, `encodeView`, `viewsEqual` (Tasks 1 y 2).
- Produces: `ViewMenu({ savedViews, currentView, canSave, canShare, onSave(name), onApply(savedView), onDelete(id), onCopyLink(): Promise<string | null>, labels })`. `onCopyLink` devuelve `null` si se copió y la URL si hay que mostrarla para copiarla a mano.
- Labels nuevos con estos valores por defecto: `views: 'Vistas'`, `savedViews: 'Vistas guardadas'`, `noSavedViews: 'Aún no hay vistas guardadas'`, `viewName: 'Nombre de la vista'`, `saveView: 'Guardar vista'`, `applyView: (n) => \`Aplicar ${n}\``, `deleteView: (n) => \`Eliminar ${n}\``, `copyViewLink: 'Copiar enlace'`, `viewLinkCopied: 'Enlace copiado'`, `viewLinkManual: 'Copia este enlace'`.
- UI según el boceto del spec: un `<details className="dt-view-menu">` con `summary.dt-button`. Muestra la lista y el formulario solo con `viewsKey`, y «Copiar enlace» solo con enlaces activos. Con enlaces activos pero sin `viewsKey`, va un botón «Copiar enlace» suelto en la barra, sin `<details>`. «Guardar vista» está deshabilitado mientras el nombre esté vacío o solo tenga espacios. La vista que coincide con la actual lleva `aria-current="true"`. El estado de copia se anuncia en `<span role="status">`. La lista vive en un estado de `DataTable` inicializado con `loadSavedViews(viewsKey)` y se guarda con `saveSavedViews` en cada cambio.

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
test('viewer saves, applies and deletes named views that persist', () => {
  const props = { columns: [{ field: 'name' }, { field: 'team' }], rows: [], searchable: true,
    viewsKey: 'views-test' };
  const { unmount } = render(<Table {...props} />);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ana' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Nombre de la vista' }), { target: { value: 'Ana' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar vista' }));
  unmount();
  render(<Table {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar Ana' }));
  assert.equal(screen.getByRole('searchbox').value, 'ana');
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar Ana' }));
  assert.deepEqual(loadSavedViews('views-test'), []);
});

test('copy link writes the current view and falls back to a visible field', async () => {
  window.history.replaceState(null, '', '/app?tab=2');
  let copied;
  Object.defineProperty(navigator, 'clipboard', { configurable: true,
    value: { writeText: async (t) => { copied = t; } } });
  render(<Table columns={[{ field: 'name' }]} rows={[]} searchable shareableViews />);
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
```

- [ ] **Step 2: Comprobar que fallan.** Ejecuta `npm run build && node --test --test-name-pattern="named views|copy link" tests/table.test.mjs`. Esperado: FAIL.
- [ ] **Step 3: Implementar `ViewMenu.jsx`, conectarlo y añadir estilos que reutilicen las clases de `dt-column-controls`.**
- [ ] **Step 4: Ejecutar `npm test`.** Esperado: PASS.
- [ ] **Step 5: Commit** — `feat: add views menu with saved views and copy link`

### Task 5: `syncViewToUrl`

**Files:**
- Modify: `src/TableBase.jsx`
- Test: `tests/table.test.mjs`

**Interfaces:**
- Consumes: `currentView`, `applyView`, `viewParam` (Task 3); `withViewParam`, `encodeView`, `readViewParam` (Tasks 1 y 2).
- Produces: con `syncViewToUrl`, un efecto que, cuando cambia `encodeView(currentView)`, programa con un temporizador de 300 ms `history.replaceState(history.state, '', withViewParam(location.href, viewParam, encoded))`. Solo escribe si la URL resultante es distinta de la actual. Un oyente de `popstate` llama `applyView(readViewParam(viewParam) ?? {})`. Al desmontar se cancela el temporizador y se quita el oyente.

- [ ] **Step 1: Escribir las pruebas que fallan** (con `mock.timers` de `node:test` para los 300 ms)

```js
test('syncViewToUrl replaces the url after a pause and reapplies on popstate', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  window.history.replaceState(null, '', '/app?tab=2#top');
  const pushes = [];
  const originalPush = window.history.pushState;
  window.history.pushState = (...a) => pushes.push(a);
  const { unmount } = render(<Table columns={[{ field: 'name' }]} rows={[]} searchable syncViewToUrl />);
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
  window.dispatchEvent(new window.PopStateEvent('popstate'));
  await waitFor(() => assert.equal(screen.getByRole('searchbox').value, 'luis'));
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'pendiente' } });
  unmount();
  t.mock.timers.tick(300);
  assert.deepEqual(readViewParam('view'), { search: 'luis' });
  window.history.pushState = originalPush;
  window.history.replaceState(null, '', '/');
});
```

- [ ] **Step 2: Comprobar que falla.** Ejecuta el comando con `--test-name-pattern="syncViewToUrl"`. Esperado: FAIL.
- [ ] **Step 3: Implementar el efecto y el oyente.**
- [ ] **Step 4: Ejecutar `npm test`.** Esperado: PASS.
- [ ] **Step 5: Commit** — `feat: optionally sync the table view to the url`

### Task 6: Documentación y ejemplo

**Files:**
- Create: `examples/ViewsExample.jsx`
- Modify: `examples/main.jsx`, `examples/README.md`, `README.md`

- [ ] **Step 1: Crear `examples/ViewsExample.jsx`.** Es un catálogo con fotos (reutiliza `examples/data.js` y sus imágenes) con `viewsKey="ejemplo-vistas"`, `shareableViews`, `allowColumnCustomization`, `allowLayoutChange`, `resizableColumns`, búsqueda y un filtro. Regístralo en `examples/main.jsx` igual que los otros cuatro.
- [ ] **Step 2: Añadir la sección «Vistas guardadas y compartibles» en `README.md`.** Incluye un ejemplo mínimo copiable, una tabla con las seis props nuevas, la precedencia, una nota sobre routers y `syncViewToUrl`, y cómo usar `encodeView`/`decodeView` con `view`/`onViewChange` para guardar vistas en un servidor. Añade también una entrada en `examples/README.md`.
- [ ] **Step 3: Verificar.** Ejecuta `npm test` (debe dar PASS) y luego `npm run examples`. Abre `http://localhost:5173/examples/` y comprueba a mano: guardar una vista, recargar, aplicarla, copiar el enlace, abrirlo en otra pestaña y ver la misma vista.
- [ ] **Step 4: Commit** — `docs: document saved and shareable views with an example`
