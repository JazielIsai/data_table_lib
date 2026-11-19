import { ImageCell } from './ImageCell.jsx';

export function GalleryView({ caption, rows, imageColumn, titleField, descriptionField,
  getRowId, selectedSet, selectable, onSelect, actions, renderAction, onImageOpen,
  loading, loadingMessage, emptyMessage, labels }) {
  const title = typeof caption === 'string' ? caption : labels.gallery;

  return <section className="dt-gallery" aria-label={title} aria-busy={loading}>
    {caption && <div className="dt-gallery-heading">{caption}</div>}
    {loading ? <div className="dt-message" role="status">{loadingMessage}</div>
      : rows.length === 0 ? <div className="dt-message dt-gallery-empty">{emptyMessage}</div>
      : <ul className="dt-gallery-grid">
        {rows.map((row, index) => {
          const id = getRowId(row, index);
          const key = String(id);
          const value = row?.[imageColumn.field];
          const heading = row?.[titleField];
          const description = descriptionField ? row?.[descriptionField] : null;
          return <li className="dt-gallery-item" key={key}>
            <article className="dt-gallery-card" aria-label={String(heading ?? id)}>
              <div className="dt-gallery-media">
                <ImageCell value={value} row={row} column={imageColumn} view="gallery"
                  openLabel={labels.imageOpen}
                  onOpen={imageColumn.previewable || imageColumn.onImageClick
                    ? () => onImageOpen(value, row, id) : undefined} />
              </div>
              <div className="dt-gallery-content">
                <div className="dt-gallery-title-row">
                  <h3>{heading == null ? String(id) : String(heading)}</h3>
                  {selectable && <input type="checkbox" checked={selectedSet.has(key)}
                    aria-label={labels.selectRow(id)} onChange={() => onSelect(id)} />}
                </div>
                {description != null && description !== '' &&
                  <p>{String(description)}</p>}
                {actions.length > 0 && <div className="dt-actions">
                  {actions.map((action, actionIndex) =>
                    renderAction(action, row, actionIndex))}
                </div>}
              </div>
            </article>
          </li>;
        })}
      </ul>}
  </section>;
}
