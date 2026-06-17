"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
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
import { cn } from "@/lib/utils";
import { DataTableConfig, EmptyStateBuilder } from "@nccirtu/tablefy";
import { DataTableHeader } from "./data-table-header";
import { DataTableEmpty } from "./data-table-empty";
import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  config?: DataTableConfig<TData>;
  className?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  config = {},
  className,
  isLoading = false,
  isError = false,
  onRetry,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(
    config.defaultSort ? [config.defaultSort] : [],
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: config.enableRowSelection ?? false,
    enableMultiRowSelection: config.enableMultiRowSelection ?? true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: config.enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: config.pagination?.enabled
      ? getPaginationRowModel()
      : undefined,
  });

  const getEmptyState = () => {
    if (isError) {
      return (
        config.emptyState || EmptyStateBuilder.make().error({ onRetry }).build()
      );
    }

    if (globalFilter && data.length > 0) {
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

  return (
    <div className={cn("flex flex-col", className)}>
      <DataTableHeader
        title={config.title}
        description={config.description}
        actions={config.headerActions}
        search={config.search}
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        table={table}
        selectedCount={selectedCount}
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
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="h-[400px]">
                  <div className="flex h-full items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <svg
                        className="animate-spin h-8 w-8 text-muted-foreground"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <span className="text-sm text-muted-foreground">
                        Laden...
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
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
                colSpan={columns.length}
              />
            )}
          </TableBody>
        </Table>
      </div>

      {config.pagination?.enabled && hasRows && (
        <DataTablePagination table={table} config={config.pagination} />
      )}
    </div>
  );
}
