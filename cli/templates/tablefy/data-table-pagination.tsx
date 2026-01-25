"use client";

import { Table as TanstackTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PaginationConfig } from "@nccirtu/tablefy";

interface DataTablePaginationProps<TData> {
  table: TanstackTable<TData>;
  config?: PaginationConfig;
  className?: string;
}

export function DataTablePagination<TData>({
  table,
  config,
  className,
}: DataTablePaginationProps<TData>) {
  if (!config?.enabled) return null;

  const {
    showPageInfo = true,
    showPageSizeSelector = true,
    pageSizeOptions = [10, 20, 30, 50, 100],
  } = config;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length > 0 ? (
          <span>
            {table.getFilteredSelectedRowModel().rows.length} von{" "}
            {table.getFilteredRowModel().rows.length} Zeile(n) ausgewählt
          </span>
        ) : showPageInfo ? (
          <span>{table.getFilteredRowModel().rows.length} Einträge</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Zeilen pro Seite
            </span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value: string) =>
                table.setPageSize(Number(value))
              }
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showPageInfo && (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Seite {table.getState().pagination.pageIndex + 1} von{" "}
            {table.getPageCount()}
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Erste Seite</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Vorherige Seite</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Nächste Seite</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Letzte Seite</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
