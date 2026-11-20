const safeCell = (value) => {
  if (value == null) return '';
  const text = typeof value === 'object' ? (value.alt ?? value.src ?? JSON.stringify(value)) : String(value);
  // Spreadsheet programs may evaluate cells beginning with these characters as formulas.
  const safe = /^[\s\u0000-\u001f]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
};

export function toCsv(rows, columns) {
  const lines = [columns.map((column) => safeCell(column.headerName ?? column.field)).join(',')];
  for (const row of rows) lines.push(columns.map((column) => safeCell(row?.[column.field])).join(','));
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

export function downloadBlob(blob, filename = 'datos.csv') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadCsv(csv, filename = 'datos.csv') {
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), filename);
}
