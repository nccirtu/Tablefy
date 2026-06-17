"use client";

import { Table as TanstackTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search, X, Columns, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeaderAction, SearchConfig, FilterConfig, BulkAction } from "../types";
import { resolveLucideIcon } from "../lib/icons";
import { DataTableFilters } from "./data-table-filters";

interface DataTableHeaderProps<TData> {
  title?: string;
  description?: string;
  actions?: HeaderAction<TData>[];
  search?: SearchConfig;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterConfig[];
  filterValues?: Record<string, any>;
  onFilterChange?: (column: string, value: any) => void;
  onResetFilters?: () => void;
  table?: TanstackTable<TData>;
  selectedCount?: number;
  bulkActions?: BulkAction<TData>[];
  onRunBulk?: (action: BulkAction<TData>) => void;
  enableColumnVisibility?: boolean;
  columnVisibilityLabel?: string;
  className?: string;
}

export function DataTableHeader<TData>({
  title,
  description,
  actions = [],
  search,
  searchValue = "",
  onSearchChange,
  filters,
  filterValues = {},
  onFilterChange,
  onResetFilters,
  table,
  selectedCount = 0,
  bulkActions,
  onRunBulk,
  enableColumnVisibility = false,
  columnVisibilityLabel = "Spalten",
  className,
}: DataTableHeaderProps<TData>) {
  const hasFilters = !!filters && filters.length > 0;
  const normalActions = actions.filter((a) => !a.hidden);
  const showBulk = selectedCount > 0 && !!bulkActions && bulkActions.length > 0;

  const bulkIcon = (action: BulkAction<TData>) => {
    const Icon = action.icon ? resolveLucideIcon(action.icon) : null;
    return Icon ? <Icon className="mr-2 h-4 w-4" /> : null;
  };

  if (
    !title &&
    !description &&
    normalActions.length === 0 &&
    !showBulk &&
    !search?.enabled &&
    !hasFilters
  ) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-4 mb-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {(search?.enabled ||
        hasFilters ||
        normalActions.length > 0 ||
        (enableColumnVisibility && !!table)) && (
        <div className="flex items-center justify-between gap-4">
          {search?.enabled && (
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={search.placeholder || "Suchen..."}
                value={searchValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onSearchChange?.(e.target.value)
                }
                className="pl-9 pr-9"
              />
              {searchValue && (
                <button
                  onClick={() => onSearchChange?.("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Rechts (justify-between): Spalten · Filter · Header-Actions (⋯) */}
          <div className="ml-auto flex items-center gap-2">
            {/* Spaltenauswahl (shadcn-Standard) — Labels aus den Columns */}
            {enableColumnVisibility && table && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Columns className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">
                      {columnVisibilityLabel}
                    </span>
                    <ChevronDown className="ml-2 hidden h-4 w-4 sm:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>{columnVisibilityLabel}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      const meta = column.columnDef.meta as
                        | { visibilityLabel?: string }
                        | undefined;
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          checked={column.getIsVisible()}
                          onCheckedChange={(value: boolean) =>
                            column.toggleVisibility(!!value)
                          }
                          onSelect={(e: Event) => e.preventDefault()}
                        >
                          {meta?.visibilityLabel || column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Filter (Popover) — eigene/Custom-Filter aus .filters([...]) */}
            {hasFilters && onFilterChange && (
              <DataTableFilters
                filters={filters!}
                values={filterValues}
                onChange={onFilterChange}
                onReset={onResetFilters || (() => {})}
              />
            )}

            {/* Header-Actions als 3-Punkte-Dropdown */}
            {normalActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Aktionen">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[220px]">
                  {normalActions.map((action, index) =>
                    action.href ? (
                      <DropdownMenuItem key={action.id || index} asChild>
                        <a href={action.href}>
                          {action.icon && (
                            <span className="mr-2">{action.icon}</span>
                          )}
                          {action.label}
                        </a>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        key={action.id || index}
                        onClick={action.onClick}
                        disabled={action.disabled || action.loading}
                        className={cn(
                          action.variant === "destructive" &&
                            "text-destructive focus:text-destructive",
                        )}
                      >
                        {action.icon && (
                          <span className="mr-2">{action.icon}</span>
                        )}
                        {action.label}
                      </DropdownMenuItem>
                    ),
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      {/* Bulk-Actions: eigene Zeile unter der Suchleiste, sobald Zeilen
          ausgewählt sind — 1 Action → Button, mehrere → „Aktionen"-Dropdown. */}
      {showBulk && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {selectedCount} ausgewählt
          </span>
          {bulkActions!.length === 1 ? (
            <Button
              variant={bulkActions![0].variant ?? "outline"}
              size="sm"
              onClick={() => onRunBulk?.(bulkActions![0])}
            >
              {bulkIcon(bulkActions![0])}
              {bulkActions![0].label}
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Aktionen
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {bulkActions!.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => onRunBulk?.(action)}
                    className={cn(
                      action.variant === "destructive" &&
                        "text-destructive focus:text-destructive",
                    )}
                  >
                    {bulkIcon(action)}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}
