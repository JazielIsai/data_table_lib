import { normalizeColumnOrder } from './columnState.js';

const VERSION = 1;
const MAX_VIEW_PARAM_LENGTH = 8192;
const MAX_SAVED_VIEWS_LENGTH = 262144;
const layouts = new Set(['table', 'gallery']);
const imageViews = new Set(['avatar', 'thumbnail', 'large', 'hidden']);
const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function compactView(view) {
  const result = {};
  if (!isPlainObject(view)) return result;
  if (typeof view.search === 'string' && view.search !== '') result.search = view.search;
  if (isPlainObject(view.filters)) {
    const filters = Object.fromEntries(Object.entries(view.filters)
      .filter(([, value]) => typeof value === 'string' && value !== ''));
    if (Object.keys(filters).length) result.filters = filters;
  }
  if (view.sort) result.sort = view.sort;
  if (Array.isArray(view.columnOrder) && view.columnOrder.length) result.columnOrder = view.columnOrder;
  for (const key of ['columnVisibility', 'columnWidths']) {
    if (isPlainObject(view[key]) && Object.keys(view[key]).length) result[key] = view[key];
  }
  if (view.layout) result.layout = view.layout;
  if (view.imageView) result.imageView = view.imageView;
  return result;
}

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text) {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

/** Serializes a view into URL-safe text. Empty fields are omitted to keep links short. */
export function encodeView(view) {
  return toBase64Url(JSON.stringify({ v: VERSION, ...compactView(view) }));
}

/** Reads text produced by encodeView. Returns null for anything invalid or from another version. */
export function decodeView(text) {
  if (typeof text !== 'string' || text === '' || text.length > MAX_VIEW_PARAM_LENGTH
    || !/^[A-Za-z0-9_-]+={0,2}$/.test(text)) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(text.replace(/=+$/, '')));
    if (!isPlainObject(parsed) || parsed.v !== VERSION) return null;
    const { v, ...view } = parsed;
    return view;
  } catch {
    return null;
  }
}

export function viewsEqual(left, right) {
  return encodeView(left) === encodeView(right);
}

/** Drops whatever in a view no longer matches the current columns. */
export function normalizeView(view, columns, { sortable = false, galleryAvailable = false } = {}) {
  const result = {};
  if (!isPlainObject(view)) return result;
  const byField = new Map(columns.map((column) => [column.field, column]));

  if (typeof view.search === 'string') result.search = view.search;
  if (isPlainObject(view.filters)) {
    result.filters = Object.fromEntries(Object.entries(view.filters)
      .filter(([field, value]) => byField.has(field) && typeof value === 'string'));
  }
  if ('sort' in view) {
    const sort = view.sort;
    const column = isPlainObject(sort) ? byField.get(sort.field) : undefined;
    const canSort = column && (sortable || column.sortable) && column.sortable !== false;
    result.sort = canSort && ['asc', 'desc'].includes(sort.direction)
      ? { field: sort.field, direction: sort.direction } : null;
  }
  if (Array.isArray(view.columnOrder)) {
    result.columnOrder = normalizeColumnOrder(view.columnOrder, columns);
  }
  if (isPlainObject(view.columnVisibility)) {
    const visibility = {};
    for (const [field, visible] of Object.entries(view.columnVisibility)) {
      const column = byField.get(field);
      if (!column || column.hidden || typeof visible !== 'boolean') continue;
      if (!visible && column.hideable === false) continue;
      visibility[field] = visible;
    }
    const shown = columns.filter((column) => !column.hidden && visibility[column.field] !== false);
    if (shown.length > 0) result.columnVisibility = visibility;
  }
  if (isPlainObject(view.columnWidths)) {
    const widths = {};
    for (const [field, value] of Object.entries(view.columnWidths)) {
      const column = byField.get(field);
      if (!column || typeof value !== 'number' || !Number.isFinite(value)) continue;
      widths[field] = Math.max(column.minWidth ?? 80, Math.min(column.maxWidth ?? 800, Math.round(value)));
    }
    result.columnWidths = widths;
  }
  if (layouts.has(view.layout)) {
    result.layout = view.layout === 'gallery' && !galleryAvailable ? 'table' : view.layout;
  }
  if (imageViews.has(view.imageView)) result.imageView = view.imageView;
  return result;
}

const isSavedView = (item) => isPlainObject(item) && typeof item.id === 'string'
  && typeof item.name === 'string' && isPlainObject(item.view);

export function loadSavedViews(key) {
  if (!key || typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key) ?? '[]';
    if (raw.length > MAX_SAVED_VIEWS_LENGTH) return [];
    const saved = JSON.parse(raw);
    return Array.isArray(saved) ? saved.filter(isSavedView) : [];
  } catch {
    return [];
  }
}

export function saveSavedViews(key, views) {
  if (!key || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(views));
  } catch {
    // Saved views stay usable for this session when storage is unavailable.
  }
}

const newId = () => globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36);

/** Adds a named view, or replaces the one that already has that name. */
export function upsertSavedView(views, name, view) {
  const trimmed = String(name ?? '').trim();
  const existing = views.find((item) => item.name === trimmed);
  if (existing) return views.map((item) => item === existing ? { ...item, view } : item);
  return [...views, { id: newId(), name: trimmed, view, createdAt: new Date().toISOString() }];
}

export function readViewParam(param, href) {
  try {
    const source = href ?? (typeof window === 'undefined' ? undefined : window.location.href);
    return source ? decodeView(new URL(source).searchParams.get(param)) : null;
  } catch {
    return null;
  }
}

const paramName = (pair) => {
  try {
    return decodeURIComponent(pair.split('=')[0].replace(/\+/g, ' '));
  } catch {
    return null;
  }
};
const paramValue = (pair) => {
  try {
    return decodeURIComponent((pair.split('=')[1] ?? '').replace(/\+/g, ' '));
  } catch {
    return '';
  }
};

/**
 * Sets or removes the view parameter while keeping the rest of the URL exactly as written.
 * A parameter with the same name that is not a view (an app's own ?view=list) is left alone.
 */
export function withViewParam(href, param, encoded) {
  const url = new URL(href);
  const pairs = url.search.replace(/^\?/, '').split('&').filter(Boolean);
  const isOurs = (pair) => paramName(pair) === param && decodeView(paramValue(pair)) !== null;
  const empty = !encoded || encoded === encodeView({});
  if (empty && !pairs.some(isOurs)) return href;
  const kept = pairs.filter((pair) => !isOurs(pair) && !(paramName(pair) === param && !empty));
  if (!empty) kept.push(`${encodeURIComponent(param)}=${encoded}`);
  url.search = kept.length ? `?${kept.join('&')}` : '';
  return url.toString();
}
