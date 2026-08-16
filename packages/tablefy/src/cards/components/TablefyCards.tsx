"use client";
import React, { ReactNode, useEffect, useRef } from "react";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DataTableHeader } from "../../tablefy/data-table-header";
import { CardBody } from "../../card/card-body";
import type { CardBuildResult } from "../../card/types";

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

export interface TablefyCardsProps<T extends Record<string, any>> {
  /** Shared card-content schema (CardSchema). */
  schema: CardBuildResult<T>;
  records: T[];
  /** Grid column count (default 3). */
  columns?: number;
  hasMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
  /** "button" (default) or "infinite" (auto-load when the sentinel scrolls in). */
  loadMode?: "button" | "infinite";
  loadMoreLabel?: string;
  emptyText?: string;
  className?: string;

  // --- header (title/description/actions/search/filters) ---
  /** Current search term; without `onSearchChange` the field stays out. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterValues?: Record<string, any>;
  onFilterChange?: (column: string, value: any) => void;
  onResetFilters?: () => void;
}

export function TablefyCards<T extends Record<string, any>>({
  schema,
  records,
  columns = 3,
  hasMore,
  loading,
  onLoadMore,
  loadMode = "button",
  loadMoreLabel = "Mehr laden",
  emptyText = "Keine Einträge",
  className,
  searchValue,
  onSearchChange,
  filterValues,
  onFilterChange,
  onResetFilters,
}: TablefyCardsProps<T>): ReactNode {
  const { title, description, headerActions, search, filters, href, plain } =
    schema.config;

  // The same header the table draws — title and description left, search,
  // filters and the create button right — so a screen reads the same whether
  // it shows a grid or a table.
  const header =
    title || description || headerActions?.length || search?.enabled || filters?.length ? (
      <>
        <DataTableHeader
          title={title}
          description={description}
          actions={headerActions}
          search={onSearchChange ? search : undefined}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          filters={onFilterChange ? filters : undefined}
          filterValues={filterValues}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
        />
        <Separator className="mb-6" />
      </>
    ) : null;
  const getItemValue = (r: T) =>
    String(schema.config.getItemValue ? schema.config.getItemValue(r) : r.id);

  // Auto-load when the sentinel scrolls into view (infinite mode).
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (loadMode !== "infinite" || !hasMore || !onLoadMore) return;
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !loading) onLoadMore();
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMode, hasMore, loading, onLoadMore, records.length]);

  if (records.length === 0 && !loading) {
    return (
      <div className={className}>
        {header}
        <div className="py-12 text-center text-sm text-muted-foreground">
          {emptyText}
        </div>
      </div>
    );
  }

  const tile = (record: T) => {
    const body = (
      <CardBody
        schema={schema}
        record={record}
        imageVariant="cover"
        bare={plain}
      />
    );

    if (plain) {
      return href ? (
        <Link
          key={getItemValue(record)}
          href={href(record)}
          className="group flex cursor-pointer flex-col gap-3"
        >
          {body}
        </Link>
      ) : (
        <div key={getItemValue(record)} className="group flex flex-col gap-3">
          {body}
        </div>
      );
    }

    return (
      <Card key={getItemValue(record)} className="overflow-hidden pt-0">
        {body}
      </Card>
    );
  };

  return (
    <div className={className}>
      {header}
      <div className={cn("grid gap-4", GRID_COLS[columns] ?? GRID_COLS[3])}>
        {records.map((record) => tile(record))}
      </div>

      {hasMore && (
        <div ref={sentinel} className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onLoadMore}
          >
            {loading ? "Lädt…" : loadMoreLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
