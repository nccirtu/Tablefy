"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  Updater,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
// shadcn components - installed by user via `npx shadcn add table`
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { DataTableConfig, ServerTableControls } from "../types";
import type { BulkAction } from "../types/table";
import { dialog } from "../dialog/dialog";
import { DataTableHeader } from "./data-table-header";
import { DataTableEmpty } from "./data-table-empty";
import { DataTablePagination } from "./data-table-pagination";
import { EmptyStateBuilder } from "../builders";

interface DataTableProps<TData, TValue> {
  columns?: ColumnDef<TData, TValue>[];
  /**
   * A built `TableSchema` (`{ columns, config }`) — the same object you pass to
   * `<ServerDataTable schema={…} />`. Alternative to passing `columns`/`config`
   * separately; ideal for client-side relation tables on a view page.
   */
  schema?: { columns: ColumnDef<TData, TValue>[]; config?: DataTableConfig<TData> };
  /** Rows. `undefined` (e.g. an unloaded deferred prop) shows the skeleton. */
  data?: TData[];
  config?: DataTableConfig<TData>;
  className?: string;
  isLoading?: boolean;
  /** Skeleton row count shown while loading. */
  skeletonRows?: number;
  isError?: boolean;
  onRetry?: () => void;
  /**
   * Drive search, sorting and pagination from the server. Pass the return
   * value of `useServerTable` (plus its `meta` paginator). When set, the
   * table runs in manual mode — no client-side filtering/sorting/paging.
   */
  server?: ServerTableControls;
}

export function DataTable<TData, TValue>({
  columns: columnsProp,
  schema,
  data,
  config: configProp,
  className,
  isLoading = false,
  skeletonRows = 5,
  isError = false,
  onRetry,
  server,
}: DataTableProps<TData, TValue>) {
  // Accept either separate columns/config or a built TableSchema.
  const columns = columnsProp ?? schema?.columns ?? [];
  const config = configProp ?? schema?.config ?? {};
  const isServer = !!server;
  const loading = isLoading || data == null;
  const tableData = data ?? [];

  // In server mode, sorting state is owned by the server controls.
  const clientSortingState = useState<SortingState>(
    config.defaultSort ? [config.defaultSort] : [],
  );
  const sorting: SortingState = isServer
    ? server!.state.sort
      ? [server!.state.sort]
      : []
    : clientSortingState[0];
  const setSorting = clientSortingState[1];

  const handleSortingChange = (updater: Updater<SortingState>) => {
    if (isServer) {
      const next =
        typeof updater === "function" ? updater(sorting) : updater;
      const first = next[0];
      server!.setSort(first ? { id: first.id, desc: first.desc } : null);
      return;
    }
    setSorting(updater);
  };
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Initialize column visibility based on visibleByDefault
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      const initialVisibility: VisibilityState = {};
      columns.forEach((column: any) => {
        if (column.meta?.visibleByDefault === false) {
          initialVisibility[column.accessorKey || column.id] = false;
        }
      });
      return initialVisibility;
    },
  );

  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Prepend a checkbox column when row selection is enabled.
  const allColumns = useMemo(() => {
    if (!config.enableRowSelection) return columns;
    const selectColumn: ColumnDef<TData, unknown> = {
      id: "__select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Alle auswählen"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Zeile auswählen"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    };
    return [selectColumn, ...columns];
  }, [columns, config.enableRowSelection]);

  const table = useReactTable({
    data: tableData,
    columns: allColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: config.enableRowSelection ?? false,
    enableMultiRowSelection:
      config.enableMultiRowSelection ?? config.enableRowSelection ?? false,
    // Server mode: the backend does the work, so disable client row models.
    manualSorting: isServer,
    manualFiltering: isServer,
    manualPagination: isServer,
    pageCount: isServer ? server!.meta.last_page : undefined,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel:
      !isServer && config.enableSorting ? getSortedRowModel() : undefined,
    // Always provided so row selection (getFilteredSelectedRowModel) works.
    // With manualFiltering=true it passes rows through without client filtering.
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel:
      !isServer && config.pagination?.enabled
        ? getPaginationRowModel()
        : undefined,
  });

  const getEmptyState = () => {
    if (isError) {
      return (
        config.emptyState || EmptyStateBuilder.make().error({ onRetry }).build()
      );
    }

    const searchActive = isServer
      ? !!server!.state.search
      : !!globalFilter && data.length > 0;
    if (searchActive) {
      return (
        config.searchEmptyState ||
        EmptyStateBuilder.make().noSearchResults({}).build()
      );
    }

    if (columnFilters.length > 0 && data.length > 0) {
      return (
        config.filterEmptyState ||
        EmptyStateBuilder.make().noFilterResults({}).build()
      );
    }

    return config.emptyState || EmptyStateBuilder.make().noData().build();
  };

  const densityClasses = {
    compact: "[&_td]:py-1 [&_th]:py-1",
    default: "[&_td]:py-3 [&_th]:py-3",
    comfortable: "[&_td]:py-4 [&_th]:py-4",
  };

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const hasRows = table.getRowModel().rows?.length > 0;

  // Filter values + handlers, unified across server and client mode.
  const filterValues: Record<string, any> = isServer
    ? server!.state.filters
    : Object.fromEntries(columnFilters.map((f) => [f.id, f.value]));

  const handleFilterChange = (column: string, value: any) => {
    if (isServer) {
      server!.setFilter?.(column, value);
      return;
    }
    table.getColumn(column)?.setFilterValue(value);
  };

  const handleResetFilters = () => {
    if (isServer) {
      server!.resetFilters?.();
      return;
    }
    table.resetColumnFilters();
  };

  const runBulkAction = (action: BulkAction<TData>) => {
    const rows = table
      .getFilteredSelectedRowModel()
      .rows.map((r) => r.original);
    const exec = () => {
      action.onClick(rows);
      if (!action.keepSelection) table.resetRowSelection();
    };
    if (action.confirm) {
      const opts =
        action.confirm === true
          ? {
              variant:
                action.variant === "destructive"
                  ? ("destructive" as const)
                  : ("default" as const),
            }
          : action.confirm;
      void dialog.confirm(opts).then((ok) => {
        if (ok) exec();
      });
    } else {
      exec();
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <DataTableHeader
        title={config.title}
        description={config.description}
        actions={config.headerActions}
        search={config.search}
        searchValue={isServer ? server!.state.search : globalFilter}
        onSearchChange={isServer ? server!.setSearch : setGlobalFilter}
        filters={config.filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        table={table}
        selectedCount={selectedCount}
        bulkActions={config.bulkActions}
        onRunBulk={runBulkAction}
        enableColumnVisibility={config.enableColumnVisibility ?? true}
        columnVisibilityLabel={config.columnVisibilityLabel}
      />

      <div
        className={cn(
          "overflow-hidden",
          config.bordered !== false && "rounded-md border",
        )}
      >
        <Table
          className={cn(
            densityClasses[config.density || "default"],
            config.striped ? "[&_tr:nth-child(even)]:bg-muted/50" : "",
            config.hoverable !== false && "[&_tr:hover]:bg-muted/50",
          )}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {allColumns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : hasRows ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <DataTableEmpty
                config={getEmptyState()}
                colSpan={allColumns.length}
              />
            )}
          </TableBody>
        </Table>
      </div>

      {isServer
        ? hasRows && (
            <DataTablePagination
              table={table}
              config={{ enabled: true, ...config.pagination }}
              server={server}
            />
          )
        : config.pagination?.enabled &&
          hasRows && (
            <DataTablePagination table={table} config={config.pagination} />
          )}
    </div>
  );
}
