import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { filterRows, paginateRows, sortRows } from './rowModel.js';
import { ActionIcon, isActionIconName } from './ActionIcon.jsx';
import { ImageCell, imageDetails } from './ImageCell.jsx';
import { ImagePreview } from './ImagePreview.jsx';
import { ColumnControls } from './ColumnControls.jsx';
import { GalleryView } from './GalleryView.jsx';
import { loadColumnPreferences, normalizeColumnOrder, saveColumnPreferences } from './columnState.js';
import { loadLayoutPreference, saveLayoutPreference } from './layoutState.js';
import { downloadCsv, toCsv } from './csv.js';

const defaultId = (row, index) => row?.id ?? index;
const initialPage = { pageIndex: 0, pageSize: 10 };

function SelectionHeader({ checked, mixed, onChange, label }) {
  return <input type="checkbox" checked={checked} aria-checked={mixed ? 'mixed' : checked}
    aria-label={label} onChange={onChange}
    ref={(node) => { if (node) node.indeterminate = mixed; }} />;
}

function ActionButton({ action, onClick, disabled }) {
  const icon = action.icon ?? (isActionIconName(action.iconName)
    ? <ActionIcon name={action.iconName} /> : null);
  const accessibleName = action.ariaLabel ?? (typeof action.label === 'string' ? action.label : undefined);
  const iconOnly = Boolean(icon && accessibleName && (action.iconOnly || action.label == null));
  const variant = ['primary', 'danger'].includes(action.variant) ? action.variant : 'default';

  return <button type="button"
    className={`dt-button dt-action-button dt-action-${variant} ${iconOnly ? 'dt-icon-only' : ''} ${action.className ?? ''}`.trim()}
    style={action.style} disabled={disabled || action.disabled}
    aria-label={accessibleName} title={iconOnly ? accessibleName : undefined}
    onClick={onClick}>
    {icon && action.iconPosition !== 'end' && <span className="dt-action-symbol">{icon}</span>}
    {action.label != null && <span className={iconOnly ? 'dt-visually-hidden' : 'dt-action-label'}>{action.label}</span>}
    {icon && action.iconPosition === 'end' && <span className="dt-action-symbol">{icon}</span>}
  </button>;
}

function cellContent({ row, column, rowIndex, imageView, imageOpenLabel, onImageOpen,
  editable, saveMode, onEdit, error, errorId, disabled, fileVersion, selectOptionLabel }) {
  const value = row?.[column.field];
  if (typeof column.renderCell === 'function') return column.renderCell(value, row, rowIndex);
  if (column.type === 'image') return <ImageCell value={value} row={row} column={column}
    view={imageView} openLabel={imageOpenLabel}
    onOpen={column.previewable || column.onImageClick ? () => onImageOpen(value, row, column) : undefined} />;
  if (!editable) return value ?? null;

  const common = {
    name: column.field,
    'aria-label': column.headerName || column.field,
    'aria-invalid': Boolean(error) || undefined,
    'aria-describedby': error ? errorId : undefined,
    disabled,
    onChange: (event) => onEdit(event, row, column)
  };

  if (column.type === 'button') {
    return <ActionButton action={column} disabled={disabled}
      onClick={(event) => column.onClick?.(event, row)} />;
  }
  if (column.type === 'select') {
    return <select {...common} className="dt-control" value={value ?? ''}
      disabled={disabled || (!saveMode && !column.onChange)}>
      {value == null && <option value="" disabled>{column.placeholder ?? selectOptionLabel}</option>}
      {(column.options ?? []).map((option) =>
        <option key={String(option.value)} value={option.value}>{option.label}</option>)}
    </select>;
  }
  if (['text', 'date', 'number', 'file'].includes(column.type)) {
    if (column.type === 'file') {
      return <input {...common} key={fileVersion} className="dt-control" type="file" />;
    }
    return <input {...common} className="dt-control" type={column.type}
      value={value ?? ''} readOnly={!saveMode && !column.onChange} />;
  }
  return value ?? null;
}

export function DataTable({
  columns = [], rows = [], actions = [], bulkActions = [], caption, editable = false,
  legacyEditActions = false, getRowId = defaultId,
  actionsHeader = 'Acciones', emptyMessage = 'No hay datos', className = '',
  sortable = false, sort: controlledSort, onSortChange,
  searchable = false, search: controlledSearch, onSearchChange,
  searchPlaceholder = 'Buscar…', filters: controlledFilters, onFiltersChange,
  paginationEnabled = false, pagination: controlledPagination, onPaginationChange,
  manualSorting = false, manualFiltering = false, manualPagination = false, rowCount,
  selectable = false, selectedRowIds: controlledSelected, onSelectionChange,
  defaultImageView = 'thumbnail', imageView: controlledImageView,
  onImageViewChange, allowImageViewChange = false,
  allowColumnCustomization = false, columnOrder: controlledColumnOrder,
  defaultColumnOrder, onColumnOrderChange,
  columnVisibility: controlledColumnVisibility, defaultColumnVisibility,
  onColumnVisibilityChange, columnPreferencesKey,
  resizableColumns = false, columnWidths: controlledColumnWidths,
  defaultColumnWidths, onColumnWidthsChange,
  csvExport,
  defaultLayout = 'table', layout: controlledLayout, onLayoutChange,
  allowLayoutChange = false, layoutPreferencesKey, gallery = {},
  loading = false, error, loadingMessage = 'Cargando…',
  editMode = 'immediate', onSave, onCancel,
  previousLabel = 'Anterior', nextLabel = 'Siguiente',
  saveLabel = 'Guardar', cancelLabel = 'Cancelar', labels = {}
}) {
  const words = {
    search: 'Buscar en la tabla',
    filter: (header) => `Filtrar ${header}`,
    filterPlaceholder: 'Filtrar…',
    selectPage: 'Seleccionar página',
    selectRow: (id) => `Seleccionar fila ${id}`,
    rowsPerPage: 'Filas por página',
    selectOption: 'Selecciona una opción',
    imageView: 'Vista de fotos',
    imageAvatar: 'Avatares',
    imageThumbnail: 'Miniaturas',
    imageLarge: 'Grandes',
    imageHidden: 'Ocultar fotos',
    imageOpen: (alt) => `Ampliar ${alt}`,
    imagePreview: 'Vista ampliada de la foto',
    imagePrevious: 'Anterior foto',
    imageNext: 'Siguiente foto',
    imageClose: 'Cerrar foto',
    columns: 'Columnas',
    resetColumns: 'Restablecer',
    moveColumnUp: (header) => `Mover ${header} a la izquierda`,
    moveColumnDown: (header) => `Mover ${header} a la derecha`,
    layout: 'Presentación',
    layoutTable: 'Tabla',
    layoutGallery: 'Galería',
    gallery: 'Galería de fotos',
    gallerySort: 'Ordenar por',
    galleryNoSort: 'Sin ordenar',
    galleryAscending: 'Orden ascendente',
    galleryDescending: 'Orden descendente',
    selectedCount: (count) => `${count} ${count === 1 ? 'seleccionado' : 'seleccionados'}`,
    bulkActions: 'Acciones de selección',
    clearSelection: 'Limpiar selección',
    exportCsv: 'Exportar CSV',
    resizeColumn: (header) => `Cambiar ancho de ${header}`,
    ...labels
  };
  const [localSort, setLocalSort] = useState(null);
  const [localSearch, setLocalSearch] = useState('');
  const [localFilters, setLocalFilters] = useState({});
  const [localPagination, setLocalPagination] = useState(initialPage);
  const [localSelected, setLocalSelected] = useState([]);
  const [localImageView, setLocalImageView] = useState(defaultImageView);
  const [storedLayout, setStoredLayout] = useState(() =>
    loadLayoutPreference(layoutPreferencesKey, defaultLayout));
  const localLayout = storedLayout.key === layoutPreferencesKey
    ? storedLayout.layout : loadLayoutPreference(layoutPreferencesKey, defaultLayout).layout;
  const columnDefaults = {
    order: defaultColumnOrder ?? columns.map((column) => column.field),
    visibility: defaultColumnVisibility ?? {},
    widths: defaultColumnWidths ?? {}
  };
  const [storedColumns, setStoredColumns] = useState(() =>
    loadColumnPreferences(columnPreferencesKey, columnDefaults));
  const localColumns = storedColumns.key === columnPreferencesKey
    ? storedColumns : loadColumnPreferences(columnPreferencesKey, columnDefaults);
  const [imagePreview, setImagePreview] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [validation, setValidation] = useState({});
  const [saving, setSaving] = useState({});
  const [saveErrors, setSaveErrors] = useState({});
  const [fileVersions, setFileVersions] = useState({});
  const [dragWidths, setDragWidths] = useState({});
  const resizeCleanup = useRef(null);
  const errorPrefix = useId().replace(/:/g, '');

  useEffect(() => {
    if (storedColumns.key !== columnPreferencesKey) setStoredColumns(localColumns);
  }, [columnPreferencesKey, storedColumns.key]);
  useEffect(() => {
    if (storedLayout.key !== layoutPreferencesKey) {
      setStoredLayout(loadLayoutPreference(layoutPreferencesKey, defaultLayout));
    }
  }, [layoutPreferencesKey, storedLayout.key]);
  useEffect(() => () => resizeCleanup.current?.(), []);

  const sort = controlledSort !== undefined ? controlledSort : localSort;
  const search = controlledSearch !== undefined ? controlledSearch : localSearch;
  const filters = controlledFilters !== undefined ? controlledFilters : localFilters;
  const pagination = controlledPagination ?? localPagination;
  const selected = controlledSelected !== undefined ? controlledSelected : localSelected;
  const imageView = controlledImageView ?? localImageView;
  const requestedLayout = controlledLayout ?? localLayout;
  const columnOrder = normalizeColumnOrder(controlledColumnOrder ?? localColumns.order, columns);
  const columnVisibility = controlledColumnVisibility ?? localColumns.visibility;
  const columnWidths = controlledColumnWidths ?? localColumns.widths ?? {};
  const columnByField = new Map(columns.map((column) => [column.field, column]));
  const orderedColumns = columnOrder.map((field) => columnByField.get(field));
  const customizableColumns = orderedColumns.filter((column) => !column.hidden);
  const preferenceVisibleFields = customizableColumns.filter((column) =>
    columnVisibility[column.field] !== false).map((column) => column.field);
  const saveMode = editable && editMode === 'save';
  const hasImageColumns = columns.some((column) => column.type === 'image' && !column.hidden);
  const visibleColumns = orderedColumns.filter((column) => !column.hidden
    && columnVisibility[column.field] !== false
    && !(column.type === 'image' && imageView === 'hidden'));
  const galleryImageColumn = columns.find((column) => column.type === 'image'
    && column.field === gallery.imageField)
    ?? columns.find((column) => column.type === 'image' && !column.hidden);
  const layout = !editable && galleryImageColumn && requestedLayout === 'gallery'
    ? 'gallery' : 'table';
  const galleryTitleField = gallery.titleField
    ?? visibleColumns.find((column) => column.type !== 'image')?.field;
  const galleryDescriptionField = gallery.descriptionField;
  const gallerySortColumns = columns.filter((column) => !column.hidden
    && column.type !== 'image' && (sortable || column.sortable) && column.sortable !== false);
  const galleryFilterColumns = columns.filter((column) => !column.hidden
    && column.type !== 'image' && column.filterable);
  const actionItems = Array.isArray(actions) ? actions : [];
  const bulkActionItems = Array.isArray(bulkActions) ? bulkActions : [];
  const hasActions = actionItems.length > 0 || saveMode;
  const showSearch = searchable || controlledSearch !== undefined;
  const showImageViewControl = allowImageViewChange && hasImageColumns;
  const showColumnControl = allowColumnCustomization && customizableColumns.length > 0;
  const showLayoutControl = !editable && Boolean(galleryImageColumn) && allowLayoutChange;
  const orderReadOnly = controlledColumnOrder !== undefined && !onColumnOrderChange;
  const visibilityReadOnly = controlledColumnVisibility !== undefined && !onColumnVisibilityChange;
  const widthsReadOnly = controlledColumnWidths !== undefined && !onColumnWidthsChange;
  const showPagination = paginationEnabled || controlledPagination !== undefined;
  const showExport = Boolean(csvExport);
  const colSpan = visibleColumns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0);

  const processedRows = useMemo(() => {
    const searchColumns = columns.map((column) => ({ ...column,
      hidden: column.hidden || columnVisibility[column.field] === false
        || (column.type === 'image' && imageView === 'hidden') }));
    const filtered = manualFiltering ? rows : filterRows(rows, searchColumns, search, filters);
    return manualSorting ? filtered : sortRows(filtered, sort, columns);
  }, [rows, columns, columnVisibility, imageView, search, filters, sort,
    manualFiltering, manualSorting]);
  const total = manualPagination ? (rowCount ?? rows.length) : processedRows.length;
  const pageSize = Math.max(1, Number(pagination.pageSize) || 10);
  const maxPage = Math.max(0, Math.ceil(total / pageSize) - 1);
  const pageIndex = Math.max(0, Math.min(Number(pagination.pageIndex) || 0, maxPage));
  const pageRows = showPagination && !manualPagination
    ? paginateRows(processedRows, pageIndex, pageSize) : processedRows;
  const previewColumn = imagePreview && columnByField.get(imagePreview.field);
  const previewEntries = previewColumn ? pageRows.map((row, index) => ({
    ...imageDetails(row?.[previewColumn.field], row, previewColumn),
    rowId: getRowId(row, index)
  })).filter((entry) => entry.source) : [];
  const previewIndex = previewEntries.findIndex((entry) =>
    String(entry.rowId) === String(imagePreview?.rowId));
  const previewEntry = previewEntries[previewIndex] ?? null;
  const selectedSet = new Set(selected.map(String));
  const pageIds = pageRows.map((row, index) => getRowId(row, index));
  const selectedPageCount = pageIds.filter((id) => selectedSet.has(String(id))).length;

  const changePage = (next) => {
    const value = { pageIndex: Math.max(0, next.pageIndex), pageSize: next.pageSize };
    if (controlledPagination === undefined) setLocalPagination(value);
    onPaginationChange?.(value);
  };
  const resetPage = () => {
    if (showPagination && pageIndex !== 0) changePage({ pageIndex: 0, pageSize });
  };
  const applySort = (next) => {
    if (controlledSort === undefined) setLocalSort(next);
    onSortChange?.(next);
    resetPage();
  };
  const changeSort = (column) => {
    const next = { field: column.field, direction:
      sort?.field === column.field && sort.direction === 'asc' ? 'desc' : 'asc' };
    applySort(next);
  };
  const changeSearch = (next) => {
    if (controlledSearch === undefined) setLocalSearch(next);
    onSearchChange?.(next);
    resetPage();
  };
  const changeFilter = (field, value) => {
    const next = { ...filters, [field]: value };
    if (controlledFilters === undefined) setLocalFilters(next);
    onFiltersChange?.(next);
    resetPage();
  };
  const changeSelection = (ids) => {
    if (controlledSelected === undefined) setLocalSelected(ids);
    onSelectionChange?.(ids, rows.filter((row, index) =>
      ids.some((id) => String(id) === String(getRowId(row, index)))));
  };
  const changeImageView = (next) => {
    if (controlledImageView === undefined) setLocalImageView(next);
    onImageViewChange?.(next);
  };
  const changeLayout = (next) => {
    if (controlledLayout === undefined) {
      setStoredLayout({ key: layoutPreferencesKey, layout: next });
    }
    onLayoutChange?.(next);
    saveLayoutPreference(layoutPreferencesKey, next);
  };
  const openImage = (value, row, column, id) => {
    if (column.onImageClick) column.onImageClick(value, row);
    else setImagePreview({ field: column.field, rowId: id });
  };
  const changeColumnOrder = (next) => {
    if (controlledColumnOrder === undefined) {
      setStoredColumns((current) => ({ ...current, key: columnPreferencesKey, order: next }));
    }
    onColumnOrderChange?.(next);
    saveColumnPreferences(columnPreferencesKey, next, columnVisibility, columnWidths);
  };
  const changeColumnVisibility = (next) => {
    if (controlledColumnVisibility === undefined) {
      setStoredColumns((current) => ({ ...current, key: columnPreferencesKey, visibility: next }));
    }
    onColumnVisibilityChange?.(next);
    saveColumnPreferences(columnPreferencesKey, columnOrder, next, columnWidths);
  };
  const changeColumnWidth = (field, width) => {
    const next = { ...columnWidths, [field]: width };
    if (controlledColumnWidths === undefined) {
      setStoredColumns((current) => ({ ...current, key: columnPreferencesKey, widths: next }));
    }
    onColumnWidthsChange?.(next);
    saveColumnPreferences(columnPreferencesKey, columnOrder, columnVisibility, next);
  };
  const widthFor = (column) => {
    const value = dragWidths[column.field] ?? columnWidths[column.field] ?? column.width;
    return Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : undefined;
  };
  const clampWidth = (column, value) => Math.max(column.minWidth ?? 80,
    Math.min(column.maxWidth ?? 800, Math.round(value)));
  const startResize = (event, column) => {
    if (event.button !== 0) return;
    event.preventDefault();
    resizeCleanup.current?.();
    const startX = event.clientX;
    const startWidth = event.currentTarget.parentElement.getBoundingClientRect().width;
    let nextWidth = clampWidth(column, startWidth);
    const move = (pointer) => {
      nextWidth = clampWidth(column, startWidth + pointer.clientX - startX);
      setDragWidths((current) => ({ ...current, [column.field]: nextWidth }));
    };
    const finish = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', cancel);
      resizeCleanup.current = null;
      setDragWidths((current) => { const next = { ...current }; delete next[column.field]; return next; });
      changeColumnWidth(column.field, nextWidth);
    };
    const cancel = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', cancel);
      resizeCleanup.current = null;
      setDragWidths((current) => { const next = { ...current }; delete next[column.field]; return next; });
    };
    resizeCleanup.current = cancel;
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', cancel);
  };
  const moveColumn = (field, direction) => {
    const visibleOrder = customizableColumns.map((column) => column.field);
    const position = visibleOrder.indexOf(field);
    const neighbor = visibleOrder[position + direction];
    if (!neighbor
      || columnByField.get(field)?.reorderable === false
      || columnByField.get(neighbor)?.reorderable === false) return;
    const next = [...columnOrder];
    const index = next.indexOf(field);
    const neighborIndex = next.indexOf(neighbor);
    [next[index], next[neighborIndex]] = [next[neighborIndex], next[index]];
    changeColumnOrder(next);
  };
  const toggleColumn = (field, visible) => {
    if (columnByField.get(field)?.hideable === false
      || (!visible && preferenceVisibleFields.length <= 1)) return;
    changeColumnVisibility({ ...columnVisibility, [field]: visible });
  };
  const resetColumns = () => {
    const order = normalizeColumnOrder(columnDefaults.order, columns);
    const nextOrder = orderReadOnly ? columnOrder : order;
    const nextVisibility = visibilityReadOnly ? columnVisibility : columnDefaults.visibility;
    const nextWidths = widthsReadOnly ? columnWidths : columnDefaults.widths;
    setStoredColumns((current) => ({ ...current, key: columnPreferencesKey,
      order: controlledColumnOrder === undefined ? nextOrder : current.order,
      visibility: controlledColumnVisibility === undefined ? nextVisibility : current.visibility,
      widths: controlledColumnWidths === undefined ? nextWidths : current.widths }));
    if (!orderReadOnly) onColumnOrderChange?.(nextOrder);
    if (!visibilityReadOnly) onColumnVisibilityChange?.(nextVisibility);
    if (!widthsReadOnly) onColumnWidthsChange?.(nextWidths);
    saveColumnPreferences(columnPreferencesKey, nextOrder, nextVisibility, nextWidths);
  };
  const exportCsv = () => {
    const scope = csvExport.scope ?? 'filtered';
    const exportRows = scope === 'selected'
      ? processedRows.filter((row, index) => selectedSet.has(String(getRowId(row, index))))
      : scope === 'page' ? pageRows : processedRows;
    const exportColumns = visibleColumns.filter((column) => column.type !== 'button');
    const context = { scope, columns: exportColumns, selectedIds: selected,
      search, filters, sort, pagination: { pageIndex, pageSize }, rowCount: total };
    if (csvExport.onExport) csvExport.onExport(exportRows, context);
    else downloadCsv(toCsv(exportRows, exportColumns), csvExport.filename);
  };
  const togglePage = () => {
    const allSelected = pageIds.length > 0 && selectedPageCount === pageIds.length;
    const next = allSelected
      ? selected.filter((id) => !pageIds.some((pageId) => String(pageId) === String(id)))
      : [...selected, ...pageIds.filter((id) => !selectedSet.has(String(id)))];
    changeSelection(next);
  };
  const updateEdit = (event, originalRow, column, id) => {
    if (!saveMode) {
      column.onChange?.(event, originalRow);
      return;
    }
    const value = column.type === 'file' ? event.target.files?.[0] ?? null : event.target.value;
    const key = String(id);
    const draft = { ...originalRow, ...drafts[key], [column.field]: value };
    setDrafts((current) => ({ ...current, [key]: draft }));
    setSaveErrors((current) => ({ ...current, [key]: '' }));
    if (column.validate) {
      const message = column.validate(value, draft) || '';
      setValidation((current) => ({
        ...current, [key]: { ...current[key], [column.field]: message }
      }));
    }
  };
  const clearDraft = (key) => {
    setDrafts((current) => { const next = { ...current }; delete next[key]; return next; });
    setValidation((current) => { const next = { ...current }; delete next[key]; return next; });
    setSaveErrors((current) => { const next = { ...current }; delete next[key]; return next; });
    setFileVersions((current) => ({ ...current, [key]: (current[key] ?? 0) + 1 }));
  };
  const saveRow = async (id, originalRow) => {
    const key = String(id);
    const draft = drafts[key];
    if (!draft || !onSave) return;
    const errors = {};
    for (const column of columns) {
      if (column.validate) {
        const message = column.validate(draft[column.field], draft);
        if (message) errors[column.field] = message;
      }
    }
    if (Object.keys(errors).length) {
      setValidation((current) => ({ ...current, [key]: errors }));
      return;
    }
    setSaving((current) => ({ ...current, [key]: true }));
    try {
      await onSave(draft, originalRow);
      clearDraft(key);
    } catch (cause) {
      setSaveErrors((current) => ({ ...current, [key]: cause?.message || 'No se pudo guardar' }));
    } finally {
      setSaving((current) => ({ ...current, [key]: false }));
    }
  };

  return (
    <div className={`dt-container ${className}`.trim()}>
      {(showSearch || showImageViewControl || showColumnControl || showLayoutControl || showExport) && <div className="dt-toolbar">
        {showSearch && <label className="dt-search-label">
          <span className="dt-visually-hidden">{words.search}</span>
          <input className="dt-control dt-search" type="search" value={search ?? ''}
            placeholder={searchPlaceholder} onChange={(event) => changeSearch(event.target.value)} />
        </label>}
        {showLayoutControl && <div className="dt-layout-control" role="group" aria-label={words.layout}>
          <button type="button" className="dt-button" aria-pressed={layout === 'table'}
            disabled={controlledLayout !== undefined && !onLayoutChange}
            onClick={() => changeLayout('table')}>{words.layoutTable}</button>
          <button type="button" className="dt-button" aria-pressed={layout === 'gallery'}
            disabled={controlledLayout !== undefined && !onLayoutChange}
            onClick={() => changeLayout('gallery')}>{words.layoutGallery}</button>
        </div>}
        {showImageViewControl && layout === 'table' && <label className="dt-image-view-label">{words.imageView}
          <select className="dt-control" value={imageView}
            disabled={controlledImageView !== undefined && !onImageViewChange}
            onChange={(event) => changeImageView(event.target.value)}>
            <option value="avatar">{words.imageAvatar}</option>
            <option value="thumbnail">{words.imageThumbnail}</option>
            <option value="large">{words.imageLarge}</option>
            <option value="hidden">{words.imageHidden}</option>
          </select>
        </label>}
        {showColumnControl && layout === 'table' && <ColumnControls columns={customizableColumns}
          visibleFields={preferenceVisibleFields} onMove={moveColumn} onToggle={toggleColumn}
          onReset={resetColumns} orderReadOnly={orderReadOnly}
          visibilityReadOnly={visibilityReadOnly} labels={words} />}
        {showExport && <button type="button" className="dt-button" onClick={exportCsv}
          disabled={loading || (csvExport.scope === 'selected' && selected.length === 0)}>
          <ActionIcon name="download" />{words.exportCsv}
        </button>}
      </div>}
      {error && <div className="dt-message dt-error" role="alert">{error}</div>}
      {selectable && selected.length > 0 && bulkActionItems.length > 0 &&
        <div className="dt-bulk-bar" role="toolbar" aria-label={words.bulkActions}>
          <strong aria-live="polite">{words.selectedCount(selected.length)}</strong>
          <div className="dt-actions">
            {bulkActionItems.map((action, index) => <ActionButton key={action.id ?? index}
              action={action} onClick={(event) => action.onClick?.(
                rows.filter((row, rowIndex) => selectedSet.has(String(getRowId(row, rowIndex)))),
                selected, event)} />)}
            <button type="button" className="dt-button" onClick={() => changeSelection([])}>
              {words.clearSelection}</button>
          </div>
        </div>}
      {layout === 'gallery' && <GalleryView caption={caption} rows={pageRows}
        imageColumn={galleryImageColumn} titleField={galleryTitleField}
        descriptionField={galleryDescriptionField} getRowId={getRowId}
        selectedSet={selectedSet} selectable={selectable}
        selectedPageCount={selectedPageCount} onTogglePage={togglePage}
        onSelect={(id) => {
          const key = String(id);
          changeSelection(selectedSet.has(key)
            ? selected.filter((item) => String(item) !== key)
            : [...selected, id]);
        }}
        actions={actionItems}
        sortColumns={gallerySortColumns} filterColumns={galleryFilterColumns}
        sort={sort} filters={filters}
        sortReadOnly={controlledSort !== undefined && !onSortChange}
        filterReadOnly={controlledFilters !== undefined && !onFiltersChange}
        onSortField={(field) => applySort(field ? { field, direction: 'asc' } : null)}
        onSortDirection={() => {
          if (sort) applySort({ field: sort.field,
            direction: sort.direction === 'asc' ? 'desc' : 'asc' });
        }}
        onFilter={changeFilter} gallery={gallery}
        renderAction={(action, row, index) => <ActionButton key={action.id ?? index}
          action={action} onClick={(event) => action.onClick?.(row, event)} />}
        onImageOpen={(value, row, id) => openImage(value, row, galleryImageColumn, id)}
        loading={loading} loadingMessage={loadingMessage} emptyMessage={emptyMessage}
        labels={words} />}
      {layout === 'table' &&
      <div className="dt-scroll">
        <table className={`dt-table ${resizableColumns ? 'dt-table-resizable' : ''}`}
          style={resizableColumns ? { width: visibleColumns.reduce((sum, column) =>
            sum + (widthFor(column) ?? 160), (selectable ? 42 : 0) + (hasActions ? 160 : 0)),
            minWidth: 0 } : undefined}
          aria-busy={loading}>
          {caption && <caption>{caption}</caption>}
          {resizableColumns && <colgroup>
            {selectable && <col style={{ width: 42 }} />}
            {visibleColumns.map((column) => <col key={column.field}
              style={{ width: widthFor(column) ?? 160 }} />)}
            {hasActions && <col style={{ width: 160 }} />}
          </colgroup>}
          <thead>
            <tr>
              {selectable && <th scope="col" className="dt-selection">
                <SelectionHeader checked={pageIds.length > 0 && selectedPageCount === pageIds.length}
                  mixed={selectedPageCount > 0 && selectedPageCount < pageIds.length}
                  onChange={togglePage} label={words.selectPage} />
              </th>}
              {visibleColumns.map((column) => {
                const canSort = (sortable || column.sortable) && column.sortable !== false;
                const direction = sort?.field === column.field ? sort.direction : null;
                return <th scope="col" key={column.field}
                  className={resizableColumns ? 'dt-resizable-heading' : undefined}
                  aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : undefined}>
                  {canSort
                    ? <button type="button" className="dt-sort" onClick={() => changeSort(column)}>
                        {column.headerName ?? column.field}
                        <span aria-hidden="true" className="dt-sort-icon">
                          {direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕'}
                        </span>
                      </button>
                    : column.headerName ?? column.field}
                  {resizableColumns && column.resizable !== false && <span
                    role="separator" tabIndex={0} aria-orientation="vertical"
                    aria-label={words.resizeColumn(column.headerName ?? column.field)}
                    aria-valuemin={column.minWidth ?? 80} aria-valuemax={column.maxWidth ?? 800}
                    aria-valuenow={widthFor(column) ?? 160}
                    className="dt-resize-handle"
                    onPointerDown={(event) => startResize(event, column)}
                    onKeyDown={(event) => {
                      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                      event.preventDefault();
                      changeColumnWidth(column.field, clampWidth(column,
                        (widthFor(column) ?? event.currentTarget.parentElement.getBoundingClientRect().width)
                        + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 25 : 10)));
                    }} />}
                </th>;
              })}
              {hasActions && <th scope="col">{actionsHeader}</th>}
            </tr>
            {visibleColumns.some((column) => column.filterable) && <tr className="dt-filter-row">
              {selectable && <th role="presentation" />}
              {visibleColumns.map((column) => <th role="presentation" key={column.field}>
                {column.filterable && <input className="dt-control" type="search"
                  aria-label={words.filter(column.headerName ?? column.field)}
                  value={filters[column.field] ?? ''} placeholder={words.filterPlaceholder}
                  onChange={(event) => changeFilter(column.field, event.target.value)} />}
              </th>)}
              {hasActions && <th role="presentation" />}
            </tr>}
          </thead>
          <tbody>
            {loading ? <tr><td className="dt-empty" colSpan={Math.max(colSpan, 1)}
              role="status">{loadingMessage}</td></tr>
              : pageRows.length === 0 ? <tr><td className="dt-empty"
                colSpan={Math.max(colSpan, 1)}>{emptyMessage}</td></tr>
              : pageRows.map((originalRow, rowIndex) => {
                const id = getRowId(originalRow, rowIndex);
                const key = String(id);
                const row = saveMode ? drafts[key] ?? originalRow : originalRow;
                const disabled = Boolean(saving[key]);
                return <tr key={id} aria-selected={selectable ? selectedSet.has(key) : undefined}>
                  {selectable && <td className="dt-selection">
                    <input type="checkbox" checked={selectedSet.has(key)}
                      aria-label={words.selectRow(id)}
                      onChange={() => changeSelection(selectedSet.has(key)
                        ? selected.filter((item) => String(item) !== key)
                        : [...selected, id])} />
                  </td>}
                  {visibleColumns.map((column) => {
                    const fieldError = validation[key]?.[column.field];
                    const errorId = `${errorPrefix}-${key}-${column.field}`;
                    return <td key={column.field} data-label={column.headerName ?? column.field}>
                      {cellContent({ row, column, rowIndex, imageView, imageOpenLabel: words.imageOpen,
                        onImageOpen: (value, currentRow, imageColumn) => {
                          openImage(value, currentRow, imageColumn, id);
                        }, editable, saveMode, error: fieldError,
                        errorId, disabled, fileVersion: fileVersions[key] ?? 0,
                        selectOptionLabel: words.selectOption,
                        onEdit: (event) => updateEdit(event, originalRow, column, id) })}
                      {fieldError && <span className="dt-field-error" id={errorId}>{fieldError}</span>}
                    </td>;
                  })}
                  {hasActions && <td data-label={actionsHeader}>
                    <div className="dt-actions">
                      {actionItems.map((action, index) => <ActionButton key={action.id ?? index}
                        action={action} disabled={disabled}
                        onClick={(event) => legacyEditActions
                          ? action.onClick?.(event, originalRow)
                          : action.onClick?.(originalRow, event)} />)}
                      {saveMode && drafts[key] && <>
                        <button type="button" className="dt-button dt-primary"
                          disabled={disabled || !onSave} onClick={() => saveRow(id, originalRow)}>
                          <ActionIcon name="check" />
                          {disabled ? loadingMessage : saveLabel}
                        </button>
                        <button type="button" className="dt-button" disabled={disabled}
                          onClick={() => { clearDraft(key); onCancel?.(originalRow); }}>
                          <ActionIcon name="close" />
                          {cancelLabel}
                        </button>
                      </>}
                    </div>
                    {saveErrors[key] && <span className="dt-field-error" role="alert">{saveErrors[key]}</span>}
                  </td>}
                </tr>;
              })}
          </tbody>
        </table>
      </div>}
      {showPagination && <div className="dt-pagination">
        <span aria-live="polite">{total === 0 ? '0' : pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, total)} de {total}</span>
        <div className="dt-page-actions">
          <label>{words.rowsPerPage}
            <select className="dt-control" value={pageSize}
              onChange={(event) => changePage({ pageIndex: 0, pageSize: Number(event.target.value) })}>
              {[10, 25, 50, 100].includes(pageSize) ? [10, 25, 50, 100].map((size) =>
                <option key={size} value={size}>{size}</option>)
                : [pageSize, 10, 25, 50, 100].map((size) =>
                  <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <button type="button" className="dt-button" disabled={pageIndex === 0 || loading}
            onClick={() => changePage({ pageIndex: pageIndex - 1, pageSize })}>{previousLabel}</button>
          <button type="button" className="dt-button" disabled={pageIndex >= maxPage || loading}
            onClick={() => changePage({ pageIndex: pageIndex + 1, pageSize })}>{nextLabel}</button>
        </div>
      </div>}
      <ImagePreview entry={previewEntry} previous={previewEntries[previewIndex - 1]}
        next={previewEntries[previewIndex + 1]}
        onPrevious={() => setImagePreview({ ...imagePreview, rowId: previewEntries[previewIndex - 1].rowId })}
        onNext={() => setImagePreview({ ...imagePreview, rowId: previewEntries[previewIndex + 1].rowId })}
        onClose={() => setImagePreview(null)} labels={words} />
    </div>
  );
}
