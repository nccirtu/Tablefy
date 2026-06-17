import type { ReactNode } from "react";

/** Visual accent for a stat card. */
export type StatColor =
  | "default"
  | "primary"
  | "success"
  | "danger"
  | "warning"
  | "info";

export type StatTrendDirection = "up" | "down" | "neutral";

export interface StatTrend {
  /** Arrow + colour direction. */
  direction: StatTrendDirection;
  /** Short label next to the arrow, e.g. "+12%". */
  label?: string;
}

/**
 * One stat card's data. Computed on the backend (PHP `Stat::make(...)`) and
 * rendered on the frontend. `name` matches the backend key so a TS schema can
 * override how a specific card renders.
 */
export interface StatData {
  name: string;
  label: string;
  value: string | number;
  description?: string;
  /** lucide icon name, e.g. "users". */
  icon?: string;
  color?: StatColor;
  trend?: StatTrend;
}

/** A resolved group of stats (one backend StatGroup → one grid). */
export interface StatGroupData {
  /** Optional heading above the grid. */
  heading?: string;
  /** Columns at the largest breakpoint (default 4). */
  columns?: number;
  stats: StatData[];
}

/** Per-card render override. Return your own node, or `undefined` to fall back. */
export type StatCardRenderer = (stat: StatData) => ReactNode;

/** Built presentation config from `Stats.make()`. */
export interface StatsConfig {
  columns?: number;
  /** Override the default rendering for every stat. */
  renderCard?: StatCardRenderer;
  /** Override rendering for a single stat by name. */
  renderers?: Record<string, StatCardRenderer>;
}
