import { ImageCell } from './ImageCell.jsx';

export function GalleryView({ caption, rows, imageColumn, titleField, descriptionField,
  getRowId, selectedSet, selectable, onSelect, actions, renderAction, onImageOpen,
  sortColumns, filterColumns, sort, filters, onSortField, onSortDirection, onFilter,
  sortReadOnly, filterReadOnly,
  onTogglePage, selectedPageCount, gallery, loading, loadingMessage, emptyMessage, labels }) {
  const title = typeof caption === 'string' ? caption : labels.gallery;
  const aspectRatio = ['auto', 'square', 'landscape', 'portrait'].includes(gallery.aspectRatio)
    ? gallery.aspectRatio : 'auto';
  const cardSize = gallery.cardSize === 'compact' ? 'compact' : 'comfortable';
  const hasControls = sortColumns.length > 0 || filterColumns.length > 0 || selectable;

  return <section className="dt-gallery" aria-label={title} aria-busy={loading}>
    {caption && <div className="dt-gallery-heading">{caption}</div>}
    {hasControls && <div className="dt-gallery-controls">
      {sortColumns.length > 0 && <div className="dt-gallery-sort">
        <label>{labels.gallerySort}
          <select className="dt-control" value={sort?.field ?? ''}
            disabled={sortReadOnly}
            onChange={(event) => onSortField(event.target.value)}>
            <option value="">{labels.galleryNoSort}</option>
            {sortColumns.map((column) => <option key={column.field} value={column.field}>
              {column.headerName ?? column.field}</option>)}
          </select>
        </label>
        <button type="button" className="dt-button" disabled={!sort || sortReadOnly}
          aria-label={sort?.direction === 'desc' ? labels.galleryAscending : labels.galleryDescending}
          onClick={onSortDirection}>{sort?.direction === 'desc' ? '↓' : '↑'}</button>
      </div>}
      {filterColumns.map((column) => <label className="dt-gallery-filter" key={column.field}>
        {labels.filter(column.headerName ?? column.field)}
        <input className="dt-control" type="search"
          disabled={filterReadOnly}
          value={filters[column.field] ?? ''} placeholder={labels.filterPlaceholder}
          onChange={(event) => onFilter(column.field, event.target.value)} />
      </label>)}
      {selectable && <label className="dt-gallery-select-page">
        <input type="checkbox" checked={rows.length > 0 && selectedPageCount === rows.length}
          disabled={loading || rows.length === 0}
          ref={(node) => { if (node) node.indeterminate = selectedPageCount > 0
            && selectedPageCount < rows.length; }}
          onChange={onTogglePage} />
        {labels.selectPage}
      </label>}
    </div>}
    {loading ? <div className="dt-message" role="status">{loadingMessage}</div>
      : rows.length === 0 ? <div className="dt-message dt-gallery-empty">{emptyMessage}</div>
      : <ul className={`dt-gallery-grid dt-gallery-grid-${cardSize} dt-gallery-grid-${aspectRatio}`}>
        {rows.map((row, index) => {
          const id = getRowId(row, index);
          const key = String(id);
          const value = row?.[imageColumn.field];
          const heading = row?.[titleField];
          const description = descriptionField ? row?.[descriptionField] : null;
          return <li className="dt-gallery-item" key={key}>
            <article className="dt-gallery-card" aria-label={String(heading ?? id)}>
              <div className={`dt-gallery-media dt-gallery-media-${aspectRatio}`}>
                <ImageCell value={value} row={row} column={imageColumn} view="gallery"
                  openLabel={labels.imageOpen} labels={labels}
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
                {gallery.renderDetails && <div className="dt-gallery-details">
                  {gallery.renderDetails(row, index)}
                </div>}
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
