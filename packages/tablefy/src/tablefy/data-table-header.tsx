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
import { renderActionIcon, resolveLucideIcon } from "../lib/icons";
import { dialog } from "../dialog/dialog";
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
  const visibleActions = actions.filter((a) => !a.hidden);
  // Buttons by default — the same shape a page action has. `overflow: true`
  // puts one behind the three-dots menu instead.
  const buttonActions = visibleActions.filter((a) => !a.overflow);
  const overflowActions = visibleActions.filter((a) => a.overflow);
  const showBulk = selectedCount > 0 && !!bulkActions && bulkActions.length > 0;

  const bulkIcon = (action: BulkAction<TData>) => {
    const Icon = action.icon ? resolveLucideIcon(action.icon) : null;
    return Icon ? <Icon className="mr-2 h-4 w-4" /> : null;
  };

  const runHeaderAction = (action: HeaderAction<TData>) => {
    if (action.form) {
      const f = action.form;
      dialog.form({
        title: f.title ?? action.label,
        description: f.description,
        schema: f.schema,
        method: f.method,
        url: f.url,
        data: f.data,
        submitLabel: f.submitLabel,
        onSuccess: f.onSuccess,
      });

      return;
    }

    action.onClick?.();
  };

  if (
    !title &&
    !description &&
    visibleActions.length === 0 &&
    !showBulk &&
    !search?.enabled &&
    !hasFilters
  ) {
    return null;
  }

  const actionButtons = buttonActions.map((action, index) =>
    action.render ? (
      <span key={action.id || index}>{action.render()}</span>
    ) : (
      <Button
        key={action.id || index}
        type="button"
        variant={action.variant}
        size={action.size}
        disabled={action.disabled || action.loading}
        asChild={!!action.href}
        onClick={action.href ? undefined : () => runHeaderAction(action)}
      >
        {action.href ? (
          <a href={action.href}>
            {action.icon && (
              <span className="mr-1">{renderActionIcon(action.icon)}</span>
            )}
            {action.label}
          </a>
        ) : (
          <>
            {action.icon && renderActionIcon(action.icon)}
            {action.label}
          </>
        )}
      </Button>
    ),
  );

  const searchField = search?.enabled ? (
    <div className="relative w-full sm:w-48">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={search.placeholder || "Suchen..."}
        value={searchValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onSearchChange?.(e.target.value)
        }
        className="w-full pl-8"
      />
    </div>
  ) : null;

  const columnPicker =
    enableColumnVisibility && table ? (
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
    ) : null;

  const overflowMenu =
    overflowActions.length > 0 ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Aktionen">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[220px]">
          {overflowActions.map((action, index) => (
            <DropdownMenuItem
              key={action.id || index}
              onClick={() => runHeaderAction(action)}
              disabled={action.disabled || action.loading}
              className={cn(
                action.variant === "destructive" &&
                  "text-destructive focus:text-destructive",
              )}
            >
              {action.icon && (
                <span className="mr-2">{renderActionIcon(action.icon)}</span>
              )}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null;

  const controls = [searchField, columnPicker, hasFilters && onFilterChange ? (
    <DataTableFilters
      key="filters"
      filters={filters!}
      values={filterValues}
      onChange={onFilterChange}
      onReset={onResetFilters || (() => {})}
    />
  ) : null, overflowMenu, ...actionButtons].filter(Boolean);

  return (
    <div className={cn("flex flex-col gap-4 mb-4", className)}>
      {/* Kopfzeile: Titel und Beschreibung links, Werkzeuge und Aktionen
          rechts — dieselbe Anordnung, die das Design überall zeigt. */}
      {(title || description || controls.length > 0) && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          {(title || description) && (
            <div className="space-y-1">
              {title && (
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}

          {controls.length > 0 && (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center lg:shrink-0">
              {controls}
            </div>
          )}
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
