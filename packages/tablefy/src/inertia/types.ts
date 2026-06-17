import { FormBuildResult } from "../forms/types/form";

export interface UseInertiaFormOptions<TData extends Record<string, any>> {
  schema: FormBuildResult<TData>;
  initialData?: Partial<TData>;
  url?: string;
  method?: "post" | "put" | "patch" | "delete";
  onSuccess?: () => void;
  onError?: (errors: Partial<Record<keyof TData, string>>) => void;
  onBefore?: () => void;
  onFinish?: () => void;
  preserveScroll?: boolean;
  /** Extra request headers (e.g. { "X-Tablefy-Modal": "1" } for modal forms). */
  headers?: Record<string, string>;
}

export interface UseInertiaFormReturn<TData extends Record<string, any>> {
  data: TData;
  errors: Partial<Record<keyof TData, string>>;
  onChange: (field: keyof TData, value: any) => void;
  onSubmit: () => void;
  processing: boolean;
  form: any;
}

export interface ServerTableConfig {
  url: string;
  defaultSort?: { id: string; desc: boolean };
  defaultPageSize?: number;
  debounce?: number;
  preserveState?: boolean;
  preserveScroll?: boolean;
  only?: string[];
}

export interface ServerTableState {
  search: string;
  sort: { id: string; desc: boolean } | null;
  page: number;
  perPage: number;
  filters: Record<string, any>;
}

export interface ServerTableReturn {
  state: ServerTableState;
  /** True while a server-table navigation (search/sort/page/filter) is in flight. */
  processing: boolean;
  setSearch: (search: string) => void;
  setSort: (sort: { id: string; desc: boolean } | null) => void;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setFilter: (key: string, value: any) => void;
  resetFilters: () => void;
}

export interface PaginatedResponse<TData> {
  data: TData[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
