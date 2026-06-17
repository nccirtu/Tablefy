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
import { PaginationConfig, ServerTableControls } from "../types";

interface DataTablePaginationProps<TData> {
  table: TanstackTable<TData>;
  config?: PaginationConfig;
  className?: string;
  /** When set, pagination is driven by the server instead of the table instance. */
  server?: ServerTableControls;
}

export function DataTablePagination<TData>({
  table,
  config,
  className,
  server,
}: DataTablePaginationProps<TData>) {
  if (!config?.enabled) return null;

  const {
    showPageInfo = true,
    showPageSizeSelector = true,
    pageSizeOptions = [10, 20, 30, 50, 100],
  } = config;

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  // --- Resolve current paging values from either the server or the table ---
  const isServer = !!server;

  const pageSize = isServer
    ? server!.meta.per_page
    : table.getState().pagination.pageSize;
  const currentPage = isServer
    ? server!.meta.current_page
    : table.getState().pagination.pageIndex + 1;
  const pageCount = isServer
    ? server!.meta.last_page
    : Math.max(table.getPageCount(), 0);
  const canPrevious = isServer ? currentPage > 1 : table.getCanPreviousPage();
  const canNext = isServer ? currentPage < pageCount : table.getCanNextPage();

  const goFirst = () => (isServer ? server!.setPage(1) : table.setPageIndex(0));
  const goPrevious = () =>
    isServer ? server!.setPage(currentPage - 1) : table.previousPage();
  const goNext = () =>
    isServer ? server!.setPage(currentPage + 1) : table.nextPage();
  const goLast = () =>
    isServer
      ? server!.setPage(pageCount)
      : table.setPageIndex(table.getPageCount() - 1);
  const changePageSize = (value: number) =>
    isServer ? server!.setPerPage(value) : table.setPageSize(value);

  // Info text: server knows the real total; client uses the filtered row count.
  const infoText = isServer
    ? server!.meta.total > 0
      ? `${server!.meta.from ?? 0}–${server!.meta.to ?? 0} von ${server!.meta.total}`
      : "Keine Einträge"
    : `${table.getFilteredRowModel().rows.length} Einträge`;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="text-sm text-muted-foreground">
        {selectedCount > 0 ? (
          <span>
            {selectedCount} von{" "}
            {isServer
              ? server!.meta.total
              : table.getFilteredRowModel().rows.length}{" "}
            Zeile(n) ausgewählt
          </span>
        ) : showPageInfo ? (
          <span>{infoText}</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Zeilen pro Seite
            </span>
            <Select
              value={`${pageSize}`}
              onValueChange={(value: string) => changePageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={`${option}`}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showPageInfo && (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Seite {pageCount > 0 ? currentPage : 0} von {pageCount}
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goFirst}
            disabled={!canPrevious}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Erste Seite</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goPrevious}
            disabled={!canPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Vorherige Seite</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goNext}
            disabled={!canNext}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Nächste Seite</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goLast}
            disabled={!canNext}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Letzte Seite</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
