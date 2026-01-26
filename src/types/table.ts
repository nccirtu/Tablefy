import { HeaderAction } from "./actions";
import { EmptyStateConfig } from "./empty-state";
import { FilterConfig, SearchConfig } from "./filters";

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
