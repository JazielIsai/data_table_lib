export function normalizeColumnOrder(order, columns) {
  const fields = columns.filter((column) => !column.hidden).map((column) => column.field);
  const allowed = new Set(fields);
  const result = [];
  for (const field of Array.isArray(order) ? order : []) {
    if (allowed.has(field) && !result.includes(field)) result.push(field);
  }
  for (const field of fields) {
    if (!result.includes(field)) result.push(field);
  }
  return result;
}

export function loadColumnPreferences(key, defaults) {
  if (!key || typeof window === 'undefined') return { key, ...defaults };
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) ?? 'null');
    return {
      key,
      order: Array.isArray(saved?.order) ? saved.order : defaults.order,
      visibility: saved?.visibility && typeof saved.visibility === 'object' && !Array.isArray(saved.visibility)
        ? saved.visibility : defaults.visibility
    };
  } catch {
    return { key, ...defaults };
  }
}

export function saveColumnPreferences(key, order, visibility) {
  if (!key || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify({ order, visibility }));
  } catch {
    // The table remains usable when browser storage is unavailable.
  }
}
