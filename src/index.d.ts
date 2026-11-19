import type { CSSProperties, ReactNode, ChangeEvent, MouseEvent } from 'react';

export type TableRow = object;
export type TableImageView = 'avatar' | 'thumbnail' | 'large' | 'hidden';
export type TableActionIconName = 'view' | 'edit' | 'delete' | 'download' | 'more' | 'check' | 'close';
export interface TableImageValue { src: string; alt?: string }
export interface TableOption { value: string | number; label: ReactNode }
export interface TableColumn<Row extends TableRow = TableRow> {
  field: string;
  headerName?: string;
  hidden?: boolean;
  hideable?: boolean;
  reorderable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  type?: 'text' | 'date' | 'number' | 'file' | 'select' | 'button' | 'image';
  options?: TableOption[];
  placeholder?: string;
  label?: ReactNode;
  ariaLabel?: string;
  icon?: ReactNode;
  iconName?: TableActionIconName;
  iconOnly?: boolean;
  iconPosition?: 'start' | 'end';
  variant?: 'default' | 'primary' | 'danger';
  style?: CSSProperties;
  imageAlt?: string | ((value: unknown, row: Row) => string);
  imageFit?: 'cover' | 'contain';
  imagePosition?: CSSProperties['objectPosition'];
  imageFallback?: ReactNode;
  previewable?: boolean;
  onImageClick?: (value: TableImageValue | string | null | undefined, row: Row) => void;
  renderCell?: (value: unknown, row: Row, rowIndex: number) => ReactNode;
  sortFn?: (left: unknown, right: unknown, leftRow: Row, rightRow: Row) => number;
  filterFn?: (value: unknown, filter: string, row: Row) => boolean;
  validate?: (value: unknown, row: Row) => string | null | undefined;
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>, row: Row) => void;
  onClick?: (event: MouseEvent<HTMLButtonElement>, row: Row) => void;
}
export interface TableAction<Row extends TableRow = TableRow> {
  id?: string | number;
  label?: ReactNode;
  icon?: ReactNode;
  iconName?: TableActionIconName;
  iconOnly?: boolean;
  iconPosition?: 'start' | 'end';
  variant?: 'default' | 'primary' | 'danger';
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  onClick?: (row: Row, event: MouseEvent<HTMLButtonElement>) => void;
}
export interface LegacyEditAction<Row extends TableRow = TableRow>
  extends Omit<TableAction<Row>, 'onClick'> {
  onClick?: (event: MouseEvent<HTMLButtonElement>, row: Row) => void;
}
export interface TableSort { field: string; direction: 'asc' | 'desc' }
export interface TablePagination { pageIndex: number; pageSize: number }
export interface TableLabels {
  search?: string;
  filter?: (header: string) => string;
  filterPlaceholder?: string;
  selectPage?: string;
  selectRow?: (id: string | number) => string;
  rowsPerPage?: string;
  selectOption?: string;
  imageView?: string;
  imageAvatar?: string;
  imageThumbnail?: string;
  imageLarge?: string;
  imageHidden?: string;
  imageOpen?: (alt: string) => string;
  imagePreview?: string;
  imagePrevious?: string;
  imageNext?: string;
  imageClose?: string;
  columns?: string;
  resetColumns?: string;
  moveColumnUp?: (header: string) => string;
  moveColumnDown?: (header: string) => string;
}
interface BaseProps<Row extends TableRow> {
  columns?: TableColumn<Row>[];
  rows?: Row[];
  actions?: TableAction<Row>[];
  caption?: ReactNode;
  actionsHeader?: ReactNode;
  getRowId?: (row: Row, index: number) => string | number;
  emptyMessage?: ReactNode;
  className?: string;
  sortable?: boolean;
  sort?: TableSort | null;
  onSortChange?: (sort: TableSort) => void;
  searchable?: boolean;
  search?: string;
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;
  filters?: Record<string, string>;
  onFiltersChange?: (filters: Record<string, string>) => void;
  paginationEnabled?: boolean;
  pagination?: TablePagination;
  onPaginationChange?: (pagination: TablePagination) => void;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  rowCount?: number;
  selectable?: boolean;
  selectedRowIds?: Array<string | number>;
  onSelectionChange?: (ids: Array<string | number>, loadedRows: Row[]) => void;
  defaultImageView?: TableImageView;
  imageView?: TableImageView;
  onImageViewChange?: (view: TableImageView) => void;
  allowImageViewChange?: boolean;
  allowColumnCustomization?: boolean;
  defaultColumnOrder?: string[];
  columnOrder?: string[];
  onColumnOrderChange?: (order: string[]) => void;
  defaultColumnVisibility?: Record<string, boolean>;
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
  /** Optional localStorage key for the table's column order and visibility. */
  columnPreferencesKey?: string;
  loading?: boolean;
  error?: ReactNode;
  loadingMessage?: ReactNode;
  previousLabel?: string;
  nextLabel?: string;
  labels?: TableLabels;
  getColumns?: TableColumn<Row>[];
  getRows?: Row[];
  onCaption?: ReactNode;
}
export interface TableProps<Row extends TableRow = TableRow> extends BaseProps<Row> {
  /** Legacy alias of actions. */
  getButtons?: TableAction<Row>[];
}
export interface TableEditProps<Row extends TableRow = TableRow> extends BaseProps<Row> {
  editMode?: 'immediate' | 'save';
  onSave?: (draft: Row, originalRow: Row) => void | Promise<void>;
  onCancel?: (originalRow: Row) => void;
  saveLabel?: string;
  cancelLabel?: string;
  /** Legacy edit actions receive (event, row). Prefer actions, which receive (row, event). */
  getButtons?: LegacyEditAction<Row>[];
}
export declare function Table<Row extends TableRow = TableRow>(props: TableProps<Row>): ReactNode;
export declare function TableEdit<Row extends TableRow = TableRow>(props: TableEditProps<Row>): ReactNode;
