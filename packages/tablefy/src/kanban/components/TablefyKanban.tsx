"use client";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnHandle,
  KanbanOverlay,
} from "@/components/ui/kanban";

// `Kanban` uses a conditional type (`T extends object ? …`) that TS can't
// evaluate against our unresolved generic; route through a concrete signature.
const KanbanRoot = Kanban as unknown as (props: {
  value: Record<string, any[]>;
  onValueChange?: (value: Record<string, any[]>) => void;
  getItemValue: (item: any) => string;
  onDragStart?: (event: any) => void;
  onDragEnd?: (event: any) => void;
  className?: string;
  children?: ReactNode;
}) => React.ReactElement;
import {
  KanbanBuildResult,
  KanbanColumn as KanbanColumnDef,
  KanbanColumnInput,
} from "../types";
import {
  getByPath,
  colorDot,
  colorBg,
  withOrphanColumns,
  groupRecords,
  locateItem,
} from "../utils";
import { KanbanCard } from "./KanbanCard";
import { Card } from "@/components/ui/card";
import { CardBody } from "../../card/card-body";

export interface KanbanMoveEvent<T> {
  item: T;
  value: string;
  fromColumn: string;
  toColumn: string;
  toIndex: number;
  /** Ordered item ids in the destination column (for stable reorder persistence). */
  columnItemIds: string[];
}

export interface TablefyKanbanProps<T extends Record<string, any>> {
  schema: KanbanBuildResult<T>;
  records: T[];
  /** Backend-provided columns (Hybrid) — used when the schema omits `columns()`. */
  columns?: KanbanColumnInput[];
  /** Per-column total counts (for the "load more" footer). */
  counts?: Record<string, number>;
  /** Fired after a card is dropped in a (possibly new) column / position. */
  onMove?: (event: KanbanMoveEvent<T>) => void;
  /** Fired when the column order changes (UI only). */
  onColumnsReorder?: (order: string[]) => void;
  /** Fired when a column's "load more" is clicked. */
  onLoadMore?: (column: string) => void;
  loadingColumn?: string | null;
  /** Column height (CSS value); columns fill it and scroll internally. */
  height?: string;
  className?: string;
}

/** Nearest scrollable ancestor (for layouts where the content area scrolls, not <body>). */
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    const oy = getComputedStyle(el).overflowY;
    if (
      (oy === "auto" || oy === "scroll") &&
      el.scrollHeight > el.clientHeight
    ) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

function normalizeColumns(
  input: KanbanColumnInput[] | undefined,
): KanbanColumnDef[] {
  if (!input) return [];
  return input.map((c) => (typeof c === "string" ? { id: c, label: c } : c));
}

export function TablefyKanban<T extends Record<string, any>>({
  schema,
  records,
  columns: backendColumns,
  counts,
  onMove,
  onColumnsReorder,
  onLoadMore,
  loadingColumn,
  height,
  className,
}: TablefyKanbanProps<T>): ReactNode {
  const { config } = schema;
  const getItemValue = useMemo(
    () => (r: T) => String(config.getItemValue ? config.getItemValue(r) : r.id),
    [config],
  );

  // Resolve columns: static schema columns (A/C) → backend prop (B/C) →
  // distinct groupBy values found in the data.
  const resolvedColumns = useMemo<KanbanColumnDef[]>(() => {
    let cols = config.columns ?? normalizeColumns(backendColumns);
    if (cols.length === 0) {
      const seen = new Set<string>();
      for (const r of records) {
        const v = getByPath(r, config.groupBy as string);
        if (v != null) seen.add(String(v));
      }
      cols = [...seen].map((id) => ({ id, label: id }));
    }
    if (config.columnStyle) {
      cols = cols.map((c) => ({ ...c, ...config.columnStyle!(c) }));
    }
    // Keep cards whose group value matches no column visible (avoid silent loss).
    return withOrphanColumns(cols, records, config.groupBy as string);
  }, [config, backendColumns, records]);

  // Group records into { columnId: records[] }, preserving column order.
  const grouped = useMemo(
    () => groupRecords(records, resolvedColumns, config.groupBy as string),
    [records, resolvedColumns, config.groupBy],
  );

  // Fill from the board's top edge down so the page itself does NOT scroll;
  // columns scroll internally. Measured live (adapts to header/toolbar height),
  // then self-corrected by the actual residual overflow of the real scroll
  // container — so layout padding / nested scroll areas can't push a page
  // scrollbar back in. An explicit `height` prop overrides the measurement.
  const boardRef = useRef<HTMLDivElement>(null);
  const [autoHeight, setAutoHeight] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (height || typeof window === "undefined") return;
    const GAP = 8;
    let raf = 0;
    const apply = (h: number) =>
      setAutoHeight(`${Math.max(240, Math.round(h))}px`);

    const measure = () => {
      const el = boardRef.current;
      if (!el) return;
      const base = window.innerHeight - el.getBoundingClientRect().top - GAP;
      apply(base);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const sc = getScrollParent(el) ?? document.scrollingElement;
        if (!sc) return;
        const overflow = sc.scrollHeight - sc.clientHeight;
        if (overflow > 1) apply(base - overflow);
      });
    };

    measure();
    // Re-measure once after deferred content (stats/toolbar) has settled.
    const t = setTimeout(measure, 250);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [height]);
  const columnHeight = height ?? autoHeight ?? "60vh";

  const [value, setValue] = useState(grouped);
  // Don't clobber live drag state with a server refresh that lands mid-drag.
  const draggingRef = useRef(false);
  useEffect(() => {
    if (!draggingRef.current) setValue(grouped);
  }, [grouped]);

  // Latest committed state, read on drag end (avoids stale closures).
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // onValueChange fires live on every drag-over → only update local state here.
  const handleValueChange = (next: Record<string, T[]>) => setValue(next);

  const locate = (mapping: Record<string, T[]>, id: string) =>
    locateItem(mapping, id, getItemValue);

  // Snapshot the dragged card's origin so we can detect a real move on drop.
  const dragStartRef = useRef<{ id: string; col: string; idx: number } | null>(
    null,
  );

  const handleDragStart = (event: any) => {
    draggingRef.current = true;
    const id = String(event?.active?.id ?? "");
    const loc = id ? locate(valueRef.current, id) : null;
    dragStartRef.current = loc ? { id, col: loc.col, idx: loc.idx } : null;
  };

  // Persist ONCE on drop (after the final onValueChange has settled state).
  const handleDragEnd = () => {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    const finish = () => {
      draggingRef.current = false;
      const v = valueRef.current;

      // Terminal-lock: a card that started in a `terminal` column can't leave it.
      if (start && config.lockTerminal !== false) {
        const startCol = resolvedColumns.find((c) => c.id === start.col);
        const now = locate(v, start.id);
        if (startCol?.kind === "terminal" && now && now.col !== start.col) {
          setValue(grouped); // snap back
          return;
        }
      }

      // Column reorder (UI key order diverged from the column definition order).
      const order = Object.keys(v);
      if (
        onColumnsReorder &&
        order.some((id, i) => id !== resolvedColumns[i]?.id)
      ) {
        onColumnsReorder(order);
      }

      if (!start || !onMove) return;
      const loc = locate(v, start.id);
      if (!loc) return;
      if (loc.col !== start.col || loc.idx !== start.idx) {
        onMove({
          item: loc.item,
          value: start.id,
          fromColumn: start.col,
          toColumn: loc.col,
          toIndex: loc.idx,
          columnItemIds: (v[loc.col] ?? []).map((it) => getItemValue(it)),
        });
      }
    };
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(finish);
    } else {
      finish();
    }
  };

  return (
    <KanbanRoot
      value={value}
      onValueChange={handleValueChange}
      getItemValue={getItemValue}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={className}
    >
      <KanbanBoard ref={boardRef} className="flex gap-4 overflow-x-auto pb-2">
        {resolvedColumns.map((col, colIndex) => {
          const items = value[col.id] ?? [];
          const total = counts?.[col.id] ?? items.length;
          const hasMore = total > items.length;
          const pipeline = config.headerStyle === "pipeline";
          const isTerminal = col.kind === "terminal";
          const handle = config.columnsMovable && (
            <KanbanColumnHandle className="ml-auto cursor-grab opacity-60 hover:opacity-100">
              <GripVertical className="h-4 w-4" />
            </KanbanColumnHandle>
          );
          return (
            <KanbanColumn
              key={col.id}
              value={col.id}
              style={{ height: columnHeight }}
              className="flex w-72 shrink-0 flex-col rounded-none border-0 bg-transparent p-0 dark:bg-transparent"
            >
              {pipeline ? (
                // Chevron für flow-Stufen, gerade für terminal (CRM-Pipeline).
                <div
                  className={cn(
                    "mb-2 flex items-center gap-2 py-2 text-sm font-medium text-white",
                    colorBg(col.color),
                    isTerminal ? "rounded-md px-3" : "pr-3",
                    !isTerminal &&
                      (colIndex === 0 ? "rounded-l-md pl-3" : "pl-6"),
                  )}
                  style={
                    !isTerminal
                      ? {
                          clipPath:
                            colIndex === 0
                              ? "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)"
                              : "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)",
                        }
                      : undefined
                  }
                >
                  <span className="truncate">{col.label}</span>
                  <span className="opacity-80">{total}</span>
                  {handle}
                </div>
              ) : (
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      colorDot(col.color),
                    )}
                  />
                  <span className="text-sm font-medium">{col.label}</span>
                  <span className="text-xs text-muted-foreground">{total}</span>
                  {handle}
                </div>
              )}
              {/* Card list fills the column and scrolls internally. */}
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto border-l-2 border-dotted border-muted-foreground/50 pl-2">
                {items.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center text-center text-xs text-muted-foreground">
                    {config.emptyText ?? "Keine Einträge"}
                  </div>
                ) : (
                  items.map((record) => {
                    const id = getItemValue(record);
                    if (!config.card) return null;
                    return (
                      <KanbanCard
                        key={id}
                        record={record}
                        value={id}
                        card={config.card}
                        showGrip={config.sortable}
                      />
                    );
                  })
                )}
                {hasMore && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-1 shrink-0 text-muted-foreground"
                    disabled={loadingColumn === col.id}
                    onClick={() => onLoadMore?.(col.id)}
                  >
                    {loadingColumn === col.id
                      ? "Lädt…"
                      : `Mehr laden (${total - items.length})`}
                  </Button>
                )}
              </div>
            </KanbanColumn>
          );
        })}
      </KanbanBoard>

      {/* Dynamic overlay: a lifted clone of the dragged card or column. */}
      <KanbanOverlay>
        {({ value: dragId, variant }) => {
          if (variant === "column") {
            const col = resolvedColumns.find((c) => c.id === dragId);
            if (!col) return null;
            const total = counts?.[col.id] ?? value[col.id]?.length ?? 0;
            return (
              <div className="w-72 rounded-lg bg-muted/60 p-2 shadow-lg ring-1 ring-primary/30">
                <div className="flex items-center gap-2 px-1">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      colorDot(col.color),
                    )}
                  />
                  <span className="text-sm font-medium">{col.label}</span>
                  <span className="text-xs text-muted-foreground">{total}</span>
                </div>
              </div>
            );
          }
          const record = records.find(
            (r) => getItemValue(r) === String(dragId),
          );
          if (!record || !config.card) return null;
          return (
            <div className="w-72 rotate-2 shadow-lg">
              <Card>
                <CardBody
                  schema={config.card}
                  record={record}
                  imageVariant="avatar"
                />
              </Card>
            </div>
          );
        }}
      </KanbanOverlay>
    </KanbanRoot>
  );
}
