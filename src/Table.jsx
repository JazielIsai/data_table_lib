import { DataTable } from './TableBase.jsx';

/** Read-only table. Action callbacks receive the row as their first argument. */
export function Table({ getColumns, getRows, getButtons, onCaption, ...props }) {
  return (
    <DataTable
      {...props}
      columns={props.columns ?? getColumns ?? []}
      rows={props.rows ?? getRows ?? []}
      actions={props.actions ?? getButtons ?? []}
      caption={props.caption ?? onCaption}
    />
  );
}
