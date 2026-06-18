/** Supported shadcn/recharts chart kinds. */
export type ChartType =
  | "area"
  | "bar"
  | "bar-multiple"
  | "line"
  | "radar"
  | "radial"
  | "pie";

export interface ChartSeriesConfig {
  label: string;
  color?: string;
}

/** shadcn `ChartConfig` shape: key → { label, color }. */
export type ChartConfigMap = Record<string, ChartSeriesConfig>;

export interface ChartOptions {
  /** Area only: show the 3m/30d/7d range selector and filter client-side. */
  interactive?: boolean;
  /** Stack bars/areas onto one another. */
  stacked?: boolean;
  /** Footer note under the chart. */
  footer?: string;
  /** Fixed chart body height (px). */
  height?: number;
  [key: string]: unknown;
}

/** Resolved chart payload sent by the backend (one ChartWidget). */
export interface ChartWidgetData {
  type: ChartType;
  heading?: string;
  description?: string;
  /** Category / x-axis key (cartesian) or the name key (pie/radial). */
  xKey: string;
  /** Value keys to plot. Pie/radial use the first. */
  series: string[];
  config: ChartConfigMap;
  data: Array<Record<string, any>>;
  options?: ChartOptions;
}

/** Optional client-side overrides for one chart (`ChartSchema.make()`). */
export interface ChartSchemaConfig {
  type?: ChartType;
  xKey?: string;
  series?: string[];
  config?: ChartConfigMap;
  options?: ChartOptions;
  heading?: string;
  description?: string;
  className?: string;
}

export interface ChartBuildResult {
  config: ChartSchemaConfig;
}
