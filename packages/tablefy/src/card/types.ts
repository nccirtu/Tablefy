import { ColumnDef } from "@tanstack/react-table";
import type { ActionItem } from "../columns/row-actions";
import type { FilterConfig, HeaderAction, SearchConfig } from "../types";

export type CardBadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive"
  | "success"
  | "warning"
  | "info"
  | "muted"
  | "neutral";

/** A badge under the card heading. */
export interface CardBadge<T extends Record<string, any>> {
  /** Text; a function receives the record. */
  label: string | ((record: T) => string | number | null | undefined);
  /** Fixed, or derived from the record — a badge often says *which* state. */
  variant?: CardBadgeVariant | ((record: T) => CardBadgeVariant);
  /** Hide the badge for records it does not apply to. */
  hidden?: (record: T) => boolean;
}

/** A card cell is any table column builder (TextColumn, BadgeColumn, …). */
export interface CardCell {
  build(): ColumnDef<any, unknown>;
  getAccessor(): string;
  getLabel(): string | undefined;
}

export interface CardRowConfig {
  cells: CardCell[];
  /** Grid columns for this row (default = number of cells). */
  columns?: number;
}

export interface CardSchemaConfig<T extends Record<string, any>> {
  /** Cover image (grid) / avatar (kanban). */
  image?: (keyof T & string) | string | ((record: T) => string | undefined);
  /** Prominent title cell. */
  heading?: CardCell;
  /** Layout rows; each row lays its cells out in a grid. */
  rows: CardRowConfig[];
  /** Show each cell's label above its value (key-value). Default true. */
  withLabels?: boolean;
  /** Row actions (three-dots menu) — same builder as the table. */
  actions?: ActionItem<T>[];
  /** Unique id extractor (defaults to `record.id`). */
  getItemValue?: (record: T) => string | number;

  /** Badges under the heading — count, origin, status. */
  badges?: CardBadge<T>[];

  /** Makes the whole card a link. */
  href?: (record: T) => string;

  /** No frame: image, heading and badges only — a catalogue tile. */
  plain?: boolean;

  // The header above the grid — same vocabulary as TableSchema, so a screen
  // reads the same whether it shows a table or a grid.
  title?: string;
  description?: string;
  headerActions?: HeaderAction<T>[];
  search?: SearchConfig;
  filters?: FilterConfig[];
}

export interface CardBuildResult<T extends Record<string, any>> {
  config: CardSchemaConfig<T>;
}
