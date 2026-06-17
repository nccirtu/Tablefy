"use client";

import { Table as TanstackTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeaderAction, SearchConfig } from "@nccirtu/tablefy";

interface DataTableHeaderProps<TData> {
  title?: string;
  description?: string;
  actions?: HeaderAction<TData>[];
  search?: SearchConfig;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  table?: TanstackTable<TData>;
  selectedCount?: number;
  className?: string;
}

export function DataTableHeader<TData>({
  title,
  description,
  actions = [],
  search,
  searchValue = "",
  onSearchChange,
  table,
  selectedCount = 0,
  className,
}: DataTableHeaderProps<TData>) {
  const normalActions = actions.filter((a) => !a.bulk && !a.hidden);
  const bulkActions = actions.filter((a) => a.bulk && !a.hidden);
  const showBulkActions = selectedCount > 0 && bulkActions.length > 0;

  const getSelectedRows = (): TData[] => {
    if (!table) return [];
    return table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  };

  const renderAction = (action: HeaderAction<TData>, index: number) => {
    if (action.children && action.children.length > 0) {
      return (
        <DropdownMenu key={action.id || index}>
          <DropdownMenuTrigger asChild>
            <Button
              variant={action.variant || "outline"}
              size={action.size || "default"}
              disabled={action.disabled || action.loading}
            >
              {action.icon}
              <span className={cn(action.icon ? "ml-2" : "")}>
                {action.label}
              </span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {action.children.map((child, childIndex) => (
              <DropdownMenuItem
                key={child.id || childIndex}
                onClick={child.onClick}
                className={cn(
                  child.variant === "destructive" &&
                    "text-destructive focus:text-destructive",
                )}
              >
                {child.icon && <span className="mr-2">{child.icon}</span>}
                {child.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    if (action.href) {
      return (
        <Button
          key={action.id || index}
          variant={action.variant || "outline"}
          size={action.size || "default"}
          disabled={action.disabled || action.loading}
          asChild
        >
          <a href={action.href}>
            {action.icon}
            {action.size !== "icon" && (
              <span className={cn(action.icon ? "ml-2" : "")}>
                {action.label}
              </span>
            )}
          </a>
        </Button>
      );
    }

    return (
      <Button
        key={action.id || index}
        variant={action.variant || "outline"}
        size={action.size || "default"}
        disabled={action.disabled || action.loading}
        onClick={() => {
          if (action.bulk && action.bulkOnClick) {
            action.bulkOnClick(getSelectedRows());
          } else if (action.onClick) {
            action.onClick();
          }
        }}
      >
        {action.loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
        ) : (
          action.icon
        )}
        {action.size !== "icon" && (
          <span className={cn(action.icon || action.loading ? "ml-2" : "")}>
            {action.label}
          </span>
        )}
      </Button>
    );
  };

  if (
    !title &&
    !description &&
    normalActions.length === 0 &&
    !search?.enabled
  ) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
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

      {(search?.enabled || normalActions.length > 0 || showBulkActions) && (
        <div className="flex items-center justify-between gap-4 mb-4">
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

          <div className="flex items-center gap-2">
            {showBulkActions && (
              <span className="text-sm text-muted-foreground">
                {selectedCount} ausgewählt
              </span>
            )}
            {showBulkActions &&
              bulkActions.map((action, index) => renderAction(action, index))}
            {normalActions.length > 0 &&
              normalActions.map((action, index) => renderAction(action, index))}
          </div>
        </div>
      )}
    </div>
  );
}
