"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../tablefy/data-table";
import { DataTableConfig } from "../types";
import { useServerTable } from "./use-server-table";
import { PaginatedResponse } from "./types";

interface ServerDataTableProps<TData> {
  /** The `TableSchema.make<T>()...build()` result. */
  schema: {
    columns: ColumnDef<TData, unknown>[];
    config: DataTableConfig<TData>;
  };
  /**
   * The Laravel paginator from the controller. `undefined` (an unloaded
   * deferred prop) shows the skeleton until it streams in.
   */
  paginator?: PaginatedResponse<TData>;
  /** The route the table reloads from (usually the resource index). */
  url: string;
  defaultSort?: { id: string; desc: boolean };
  defaultPageSize?: number;
  debounce?: number;
  only?: string[];
  /** Skeleton row count while loading (default 5). */
  skeletonRows?: number;
  isError?: boolean;
  onRetry?: () => void;
  className?: string;
}

/**
 * Declarative server-driven table: one component, zero wiring.
 *
 * Internally sets up `useServerTable` and feeds the current page + paginator meta
 * into `<DataTable server={...} />`. Defaults for sort/page size are taken from the
 * schema config, so a list page is effectively a one-liner:
 *
 * ```tsx
 * <ServerDataTable schema={customersTable} paginator={customers} url="/customers" />
 * ```
 */
export function ServerDataTable<TData>({
  schema,
  paginator,
  url,
  defaultSort,
  defaultPageSize,
  debounce,
  only,
  ...rest
}: ServerDataTableProps<TData>) {
  const server = useServerTable({
    url,
    defaultSort: defaultSort ?? schema.config.defaultSort,
    defaultPageSize:
      defaultPageSize ?? schema.config.pagination?.pageSize ?? paginator?.per_page,
    debounce,
    only,
  });

  return (
    <DataTable
      columns={schema.columns}
      data={paginator?.data}
      config={schema.config}
      isLoading={server.processing}
      server={paginator ? { ...server, meta: paginator } : undefined}
      {...rest}
    />
  );
}
