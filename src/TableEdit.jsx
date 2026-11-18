import { DataTable } from './TableBase.jsx';

/** Editable table. Update rows in a column's onChange callback. */
export function TableEdit({ getColumns, getRows, getButtons, onCaption, ...props }) {
  return (
    <DataTable
      {...props}
      editable
      columns={props.columns ?? getColumns ?? []}
      rows={props.rows ?? getRows ?? []}
      actions={props.actions ?? getButtons ?? []}
      legacyEditActions={props.actions == null && getButtons != null}
      caption={props.caption ?? onCaption}
    />
  );
}
