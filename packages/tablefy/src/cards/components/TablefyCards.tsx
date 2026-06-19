"use client";
import React, { ReactNode, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
}: TablefyCardsProps<T>): ReactNode {
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
      <div className="py-12 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={cn("grid gap-4", GRID_COLS[columns] ?? GRID_COLS[3])}>
        {records.map((record) => (
          <Card key={getItemValue(record)} className="overflow-hidden pt-0">
            <CardBody schema={schema} record={record} imageVariant="cover" />
          </Card>
        ))}
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
