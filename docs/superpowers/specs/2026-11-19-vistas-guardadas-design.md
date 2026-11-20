# Vistas guardadas y compartibles — diseño

Fecha: 2026-11-19 · Estado: borrador para aprobación

## Intención

Data Table Lib quiere destacar por hacer fácil y cuidada la transición entre datos tabulares y visuales, no por cantidad de funciones. Una persona que configura la tabla (busca, filtra, ordena, elige columnas, anchos, tabla o galería, tamaño de fotos) debe poder **guardar esa configuración con un nombre** y **compartirla mediante un enlace** que la reproduzca, sin que la aplicación integradora necesite un backend.

Es el primero de cinco frentes (vistas, fotos, datos remotos, accesibilidad, documentación); los demás se diseñan por separado.

## Objetivos

- Un objeto único y serializable `TableView` que describe la vista actual.
- Vistas con nombre guardadas en `localStorage` (guardar, aplicar, eliminar) desde un menú en la barra de herramientas.
- Botón «Copiar enlace» que produce una URL que reproduce la vista.
- Al montar, la tabla lee la vista del enlace y la aplica.
- Opcional (`syncViewToUrl`): la URL refleja la vista en vivo mientras se usa la tabla.
- API controlada (`view` / `defaultView` / `onViewChange`) y funciones puras `encodeView` / `decodeView`, base para guardar vistas en servidor más adelante (opción B).

## No objetivos

- Guardar vistas en un servidor o sincronizarlas entre dispositivos (queda posible vía la API controlada).
- Guardar paginación (página ni tamaño) o selección de filas.
- Compartir filas/datos: el enlace solo lleva estado. Con modos `manual*`, la app vuelve a pedir datos al recibir los callbacks.
- Añadir entradas al historial del navegador (`pushState`).

## Anti-objetivos (fallo aunque funcione)

- Romper o cambiar el comportamiento de props existentes (`columnPreferencesKey`, `layoutPreferencesKey`, props controladas individuales).
- Tocar la URL cuando `syncViewToUrl` está apagado.
- Que un enlace corrupto, antiguo o manipulado rompa la tabla o lance errores.
- Que la funcionalidad no sea usable con teclado y lector de pantalla.

## Enfoques considerados

1. **Integrado en `Table` mediante props (elegido).** Sigue el patrón de `columnPreferencesKey`/`layoutPreferencesKey`; cero integración extra. La lógica pura vive en `src/viewState.js` y la UI en `src/ViewMenu.jsx` para no inflar `TableBase.jsx`.
2. **Hook `useTableViews()` + `<ViewMenu>` separados.** Tabla intacta, pero más código para integrar; va contra «fácil por defecto».
3. **Sincronización en vivo de la URL.** Elegida **además** de la 1, como opción explícita (`syncViewToUrl`, apagada por defecto) por el riesgo con routers (React Router, Next) que reescriben la URL. Mitigación: `replaceState`, con espera breve, y escucha de `popstate`.

La persona usuaria eligió 1 + 3.

## Diseño

### Objeto `TableView` (versión 1)

```ts
interface TableView {
  search?: string;
  filters?: Record<string, string>;
  sort?: TableSort | null;
  columnOrder?: string[];
  columnVisibility?: Record<string, boolean>;
  columnWidths?: Record<string, number>;
  layout?: 'table' | 'gallery';
  imageView?: TableImageView;
}
interface TableSavedView { id: string; name: string; view: TableView; createdAt: string }
```

Campos ausentes = «sin cambio respecto al valor por defecto». Al codificar se omiten los vacíos (búsqueda vacía, filtros vacíos, sort nulo) para acortar el enlace.

### Codificación del enlace

- `encodeView(view)` → `JSON.stringify({ v: 1, ...vistaCompacta })` → UTF-8 → base64url (sin `=`). Debe funcionar con acentos y emoji.
- `decodeView(texto)` → objeto `TableView` o `null` si el texto es inválido, el JSON no parsea, no es objeto o `v !== 1`.
- Parámetro de URL: `view` por defecto; configurable para tener dos tablas en una página.
- Al copiar el enlace se conserva el resto de la URL (ruta, otros parámetros, hash) y solo se sustituye ese parámetro.

### Normalización (al aplicar cualquier vista: enlace, guardada o controlada)

Una función `normalizeView(view, columns, opciones)` en `viewState.js` descarta lo que no encaja con las columnas actuales:
- `columnOrder` vía `normalizeColumnOrder` existente (columnas nuevas se añaden al final, desconocidas se quitan).
- `columnVisibility`: solo campos existentes; nunca oculta columnas con `hideable: false`; si dejaría cero columnas visibles, se ignora.
- `columnWidths`: solo números finitos, limitados a `minWidth`/`maxWidth` de cada columna (80/800 por defecto, como hoy).
- `sort`: se descarta si el campo no existe o no es ordenable, o si `direction` no es `asc`/`desc`.
- `filters`: solo campos de columnas existentes, valores string.
- `layout`/`imageView`: solo valores válidos; `gallery` se respeta solo si es posible hoy (no editable y con columna de imagen), igual que la lógica actual.

### Props nuevas (en `BaseProps`, valen para `Table` y `TableEdit`)

| Prop | Tipo | Efecto |
|---|---|---|
| `view` | `TableView` | Vista controlada. Alimenta cada pieza cuya prop individual no esté controlada. |
| `defaultView` | `TableView` | Vista inicial no controlada. |
| `onViewChange` | `(view: TableView) => void` | Se llama cuando cambia cualquier campo de la vista, venga de la UI, de aplicar una vista guardada o de un enlace. |
| `viewsKey` | `string` | Activa el menú «Vistas» y guarda las vistas con nombre en `localStorage` bajo esa clave. |
| `shareableViews` | `boolean \| { param?: string }` | Activa «Copiar enlace» y la lectura del enlace al montar. |
| `syncViewToUrl` | `boolean` | Requiere/implica `shareableViews`. Escribe la vista en la URL con `history.replaceState` (espera ~300 ms) y re-aplica la vista en `popstate`. |

**Precedencia al montar** (de mayor a menor): prop individual controlada (`sort`, `search`, …) > `view` controlada > vista del enlace > `defaultView` > preferencias guardadas (`columnPreferencesKey`, `layoutPreferencesKey`) > valores por defecto del componente.

**Aplicar una vista** (enlace, guardada o `popstate`) pasa por los mismos `change*` internos que ya existen, así que llama `onSearchChange`, `onFiltersChange`, `onSortChange`, `onColumnOrderChange`, etc. Esto hace que los modos `manual*` vuelvan a pedir datos sin código extra, y vuelve la página a 0. Las piezas de solo lectura (controladas sin callback) no se tocan.

Aplicar un enlace **no** borra las preferencias guardadas por `columnPreferencesKey`/`layoutPreferencesKey`; estas se actualizan, como hoy, en el siguiente cambio de la persona usuaria.

### Interfaz: menú «Vistas»

Un `<details>` en la barra, con el mismo estilo que `ColumnControls`:

```
[Vistas ▾]
 ┌──────────────────────────────┐
 │ Vistas guardadas             │
 │  • Solo Ventas      [Aplicar] [Eliminar] │
 │  • Catálogo grande  [Aplicar] [Eliminar] │
 │ ─────────────────────────────│
 │ Nombre [__________] [Guardar vista] │
 │ [Copiar enlace]              │
 │ (región aria-live: «Enlace copiado») │
 └──────────────────────────────┘
```

- Solo aparece «Vistas guardadas»/«Guardar» si hay `viewsKey`; solo «Copiar enlace» si hay `shareableViews`. Si hay `shareableViews` sin `viewsKey`, un botón «Copiar enlace» suelto en la barra basta.
- Guardar con un nombre que ya existe reemplaza esa vista. Nombre vacío deshabilita «Guardar».
- La vista aplicada actualmente se marca (`aria-current="true"`) si coincide con la vista en uso.
- Copiar usa `navigator.clipboard.writeText`; si no está disponible o falla, muestra el enlace en un campo de solo lectura seleccionado para copiarlo a mano.
- Todos los textos nuevos van en `labels` con valores por defecto en español: `views`, `savedViews`, `saveView`, `viewName`, `applyView(name)`, `deleteView(name)`, `copyViewLink`, `viewLinkCopied`, `viewLinkManual`, `noSavedViews`.

### Exportaciones públicas

`encodeView`, `decodeView` y los tipos `TableView`, `TableSavedView` desde `src/lib.js` / `index.d.ts`.

### Archivos

- `src/viewState.js` (nuevo): encode/decode, normalize, carga/guardado de vistas con nombre, lectura/escritura del parámetro de URL.
- `src/ViewMenu.jsx` (nuevo): la UI.
- `src/TableBase.jsx`: montar la vista inicial, construir la vista actual, `applyView`, efectos de URL.
- `src/index.d.ts`, `src/lib.js`, `src/table.css`.
- `tests/table.test.mjs`, `tests/types.tsx`.
- `README.md` (sección «Vistas guardadas y compartibles»), `examples/ViewsExample.jsx` y enlace desde `examples/README.md`.

### Pruebas mínimas

- `encodeView`/`decodeView`: ida y vuelta, acentos/emoji, texto corrupto, versión desconocida → `null`.
- Normalización: columna desconocida, sort inválido, ancho fuera de rango, ocultar columna bloqueada, ocultar todas.
- Enlace al montar aplica la vista; con `manualFiltering` llama `onFiltersChange`/`onSearchChange`.
- Guardar, aplicar y eliminar vistas con nombre persiste en `localStorage` y sobrevive a desmontar.
- «Copiar enlace» escribe en el portapapeles una URL que conserva otros parámetros; fallback sin portapapeles.
- `syncViewToUrl` usa `replaceState` (no `pushState`) y `popstate` re-aplica; sin la prop, la URL no cambia.
- Props controladas individuales siguen teniendo prioridad; `onViewChange` recibe la vista completa.

## Decisiones del constructor (marcadas como mías, corregibles)

- SSR: el enlace se lee en el inicializador de estado si existe `window`, igual que hoy con `localStorage`; no se añade manejo especial de hidratación.
- Ids de vistas guardadas: `crypto.randomUUID()` si existe, si no `Date.now()` en base 36.
- El menú se oculta en una tabla sin columnas personalizables ni búsqueda, ya que no hay nada que guardar.
- Versión: se publica en la próxima prealfa (`2.0.0-alpha.7`; `main` ya está en alpha.6).
