const validLayouts = new Set(['table', 'gallery']);

export function loadLayoutPreference(key, fallback) {
  const defaultLayout = validLayouts.has(fallback) ? fallback : 'table';
  if (!key || typeof window === 'undefined') return { key, layout: defaultLayout };
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) ?? 'null');
    return { key, layout: validLayouts.has(saved?.layout) ? saved.layout : defaultLayout };
  } catch {
    return { key, layout: defaultLayout };
  }
}

export function saveLayoutPreference(key, layout) {
  if (!key || typeof window === 'undefined' || !validLayouts.has(layout)) return;
  try {
    window.localStorage.setItem(key, JSON.stringify({ layout }));
  } catch {
    // The layout switch remains usable without browser storage.
  }
}
