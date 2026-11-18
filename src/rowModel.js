const display = (value) => value == null ? '' : String(value);

export function filterRows(rows, columns, search, filters) {
  const searchable = columns.filter((column) => !column.hidden && column.searchable !== false);
  const query = String(search ?? '').trim().toLocaleLowerCase();
  return rows.filter((row) => {
    if (query && !searchable.some((column) =>
      display(row[column.field]).toLocaleLowerCase().includes(query))) return false;
    return Object.entries(filters ?? {}).every(([field, filter]) => {
      if (filter == null || filter === '') return true;
      const column = columns.find((item) => item.field === field);
      if (!column) return true;
      if (column.filterFn) return column.filterFn(row[field], filter, row);
      return display(row[field]).toLocaleLowerCase().includes(
        display(filter).toLocaleLowerCase()
      );
    });
  });
}

export function sortRows(rows, sort, columns) {
  if (!sort?.field || !sort?.direction) return rows;
  const column = columns.find((item) => item.field === sort.field);
  if (!column) return rows;
  const multiplier = sort.direction === 'desc' ? -1 : 1;
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  return rows.map((row, index) => ({ row, index })).sort((a, b) => {
    const left = a.row[sort.field];
    const right = b.row[sort.field];
    if (left == null && right == null) return a.index - b.index;
    if (left == null) return 1;
    if (right == null) return -1;
    const result = column.sortFn
      ? column.sortFn(left, right, a.row, b.row)
      : typeof left === 'number' && typeof right === 'number'
        ? left - right
        : collator.compare(display(left), display(right));
    return result * multiplier || a.index - b.index;
  }).map(({ row }) => row);
}

export function paginateRows(rows, pageIndex, pageSize) {
  return rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
}
