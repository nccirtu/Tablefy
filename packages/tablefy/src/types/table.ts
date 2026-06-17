import { HeaderAction } from "./actions";
import { EmptyStateConfig } from "./empty-state";
import { FilterConfig, SearchConfig } from "./filters";
import type { ConfirmOptions } from "../confirm/types";

/**
 * A bulk action runs on the currently selected rows. Shown in a bar above the
 * table when at least one row is selected.
 */
export interface BulkAction<TData> {
  label: string;
  /** lucide icon name, e.g. "trash". */
  icon?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  /** Confirm before running (true = default copy, or custom options). */
  confirm?: boolean | ConfirmOptions;
  /** Receives the selected rows' records. */
  onClick: (rows: TData[]) => void;
  /** Keep the selection after running (default: clear it). */
  keepSelection?: boolean;
}

/**
 * Pagination Configuration
 * Defines pagination settings for the table
 */
export interface PaginationConfig {
  enabled: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPageInfo?: boolean;
  showPageSizeSelector?: boolean;
}

/**
 * Server-side pagination meta (shape of a Laravel paginator response).
 */
export interface ServerPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

/**
 * Controls for driving a table from the server.
 *
 * Structurally compatible with the return value of `useServerTable`
 * (from `@nccirtu/tablefy/inertia`) plus a `meta` paginator object.
 * Pass it to `<DataTable server={...} />` to switch search, sorting and
 * pagination from client-side to server-side.
 */
export interface ServerTableControls {
  state: {
    search: string;
    sort: { id: string; desc: boolean } | null;
    page: number;
    perPage: number;
    filters: Record<string, any>;
  };
  meta: ServerPaginationMeta;
  setSearch: (search: string) => void;
  setSort: (sort: { id: string; desc: boolean } | null) => void;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setFilter?: (key: string, value: any) => void;
  resetFilters?: () => void;
}

/**
 * Complete Data Table Configuration
 * Main configuration object for the data table component
 */
export interface DataTableConfig<TData> {
  // Header
  title?: string;
  description?: string;
  headerActions?: HeaderAction<TData>[];

  // Empty States
  emptyState?: EmptyStateConfig;
  searchEmptyState?: EmptyStateConfig;
  filterEmptyState?: EmptyStateConfig;

  // Features
  search?: SearchConfig;
  filters?: FilterConfig[];
  pagination?: PaginationConfig;

  // Selection
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  /** Actions shown in a bar when rows are selected. */
  bulkActions?: BulkAction<TData>[];

  // Sorting
  enableSorting?: boolean;
  defaultSort?: { id: string; desc: boolean };

  // Visibility
  enableColumnVisibility?: boolean;
  columnVisibilityLabel?: string;

  // Density
  density?: "compact" | "default" | "comfortable";

  // Styling
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
}
