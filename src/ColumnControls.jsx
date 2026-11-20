export function ColumnControls({ columns, visibleFields, onMove, onToggle, onReset,
  orderReadOnly, visibilityReadOnly, labels }) {
  const visibleCount = visibleFields.length;

  return <details className="dt-column-controls">
    <summary className="dt-button">{labels.columns}</summary>
    <div className="dt-column-panel">
      <div className="dt-column-panel-heading">
        <strong>{labels.columns}</strong>
        <button type="button" className="dt-column-reset" onClick={onReset}
          disabled={orderReadOnly && visibilityReadOnly}>{labels.resetColumns}</button>
      </div>
      <ul>
        {columns.map((column, index) => {
          const label = column.headerName ?? column.field;
          const visible = visibleFields.includes(column.field);
          const previous = columns[index - 1];
          const next = columns[index + 1];
          return <li key={column.field}>
            <label className="dt-column-toggle">
              <input type="checkbox" checked={visible}
                disabled={visibilityReadOnly || column.hideable === false || (visible && visibleCount <= 1)}
                onChange={(event) => onToggle(column.field, event.target.checked)} />
              <span>{label}</span>
            </label>
            <span className="dt-column-move">
              <button type="button" className="dt-button"
                aria-label={labels.moveColumnUp(label)} title={labels.moveColumnUp(label)}
                disabled={orderReadOnly || !previous || column.pinned !== previous.pinned
                  || column.reorderable === false || previous.reorderable === false}
                onClick={() => onMove(column.field, -1)}>↑</button>
              <button type="button" className="dt-button"
                aria-label={labels.moveColumnDown(label)} title={labels.moveColumnDown(label)}
                disabled={orderReadOnly || !next || column.pinned !== next.pinned
                  || column.reorderable === false || next.reorderable === false}
                onClick={() => onMove(column.field, 1)}>↓</button>
            </span>
          </li>;
        })}
      </ul>
    </div>
  </details>;
}
