import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChartWidgetData } from "../types";
import { TablefyChart } from "./TablefyChart";
import { ChartSkeleton } from "./ChartSkeleton";

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 lg:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
};

export interface TablefyChartsProps {
  /** Resolved charts from the backend. `undefined` → skeletons (deferred). */
  data?: ChartWidgetData[] | ChartWidgetData;
  columns?: number;
  skeletonCount?: number;
  className?: string;
}

/**
 * Renders a responsive grid of backend-provided charts. Mirrors `<TablefyStats>`:
 * shows skeletons until the deferred `charts` prop streams in.
 */
export function TablefyCharts({
  data,
  columns = 2,
  skeletonCount = 2,
  className,
}: TablefyChartsProps): ReactNode {
  const grid = cn(
    "grid gap-4",
    GRID_COLS[columns] ?? GRID_COLS[2],
    className,
  );

  if (data === undefined) {
    return (
      <div className={grid}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ChartSkeleton key={i} />
        ))}
      </div>
    );
  }

  const charts = Array.isArray(data) ? data : [data];
  if (charts.length === 0) return null;

  return (
    <div className={grid}>
      {charts.map((chart, i) => (
        <TablefyChart key={chart.heading ?? i} chart={chart} />
      ))}
    </div>
  );
}
