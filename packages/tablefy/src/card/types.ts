import { ColumnDef } from "@tanstack/react-table";
import type { ActionItem } from "../columns/row-actions";

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
}

export interface CardBuildResult<T extends Record<string, any>> {
  config: CardSchemaConfig<T>;
}
