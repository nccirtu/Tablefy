"use client";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { KanbanBuildResult } from "../types";
import { TablefyKanban, KanbanMoveEvent } from "./TablefyKanban";
import { KanbanSkeleton } from "./KanbanSkeleton";

interface KanbanConfigProp {
  enabled: boolean;
  groupBy: string;
  sortable: boolean;
  columnsMovable: boolean;
  perColumn: number;
  columns: { id: string; label: string; color?: string }[];
  moveUrl: string;
}

type ColumnData = Record<string, { items: any[]; total: number }>;

export interface ServerKanbanProps<T extends Record<string, any>> {
  schema: KanbanBuildResult<T>;
  renderActions?: (record: T) => ReactNode;
  /** Column height (CSS value); columns fill it and scroll internally. */
  height?: string;
  className?: string;
  /** Page-prop names (match the backend). */
  configProp?: string;
  dataProp?: string;
}

/**
 * Inertia-wired Kanban board. Reads the `kanban` config + deferred
 * `kanbanColumns` data from the page props, requests the data on mount,
 * persists moves to `moveUrl`, and raises per-column limits for "load more".
 */
export function ServerKanban<T extends Record<string, any>>({
  schema,
  renderActions,
  height,
  className,
  configProp = "kanban",
  dataProp = "kanbanColumns",
}: ServerKanbanProps<T>): ReactNode {
  const page = usePage();
  const config = page.props[configProp] as KanbanConfigProp | undefined;
  const data = page.props[dataProp] as ColumnData | undefined;

  const [limits, setLimits] = useState<Record<string, number>>({});
  const [loadingColumn, setLoadingColumn] = useState<string | null>(null);

  // Pull the (optional) grouped data once the board mounts.
  useEffect(() => {
    if (config?.enabled && !data) {
      router.reload({ only: [dataProp] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.enabled, !!data]);

  const records = useMemo(
    () => (data ? Object.values(data).flatMap((c) => c.items) : []),
    [data],
  );
  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    if (data) for (const [id, c] of Object.entries(data)) out[id] = c.total;
    return out;
  }, [data]);

  if (!config?.enabled) return null;

  // Deferred data not here yet → board skeleton (matches the table's UX).
  if (!data) {
    return (
      <KanbanSkeleton
        columns={config.columns?.length || 3}
        height={height}
        className={className}
      />
    );
  }

  const onMove = (e: KanbanMoveEvent<T>) => {
    router.post(
      config.moveUrl,
      {
        id: e.value,
        column: e.toColumn,
        position: e.toIndex,
        // Ordered ids in the target column → backend renumbers `position`.
        ids: e.columnItemIds,
      },
      {
        preserveScroll: true,
        preserveState: true,
        only: [dataProp],
        // Server rejected/failed the move → resync the board from the server.
        onError: () => router.reload({ only: [dataProp] }),
      },
    );
  };

  const onLoadMore = (column: string) => {
    const next = {
      ...limits,
      [column]: (limits[column] ?? config.perColumn) + config.perColumn,
    };
    setLimits(next);
    setLoadingColumn(column);
    router.reload({
      only: [dataProp],
      data: { kanban_limits: next },
      onFinish: () => setLoadingColumn(null),
    });
  };

  return (
    <TablefyKanban
      schema={schema}
      records={records as T[]}
      columns={config.columns?.length ? config.columns : undefined}
      counts={counts}
      renderActions={renderActions}
      onMove={onMove}
      onLoadMore={onLoadMore}
      loadingColumn={loadingColumn}
      height={height}
      className={className}
    />
  );
}
