import { ReactNode } from "react";

/** A single Kanban column / state. */
export interface KanbanColumn {
  id: string;
  label: string;
  /** Tailwind color name (e.g. "amber") or any CSS color for the accent/header. */
  color?: string;
  icon?: ReactNode;
  /** `flow` = sequential step (chevron header); `terminal` = final state (flat). Default flow. */
  kind?: "flow" | "terminal";
}

/** Backend-provided column descriptor (Hybrid: used when the schema omits columns). */
export type KanbanColumnInput = KanbanColumn | string;

type Accessor<T> = (keyof T & string) | string;
type ValueFn<T> = (record: T) => ReactNode;

export interface KanbanCardMeta<T extends Record<string, any>> {
  field?: Accessor<T>;
  value?: ValueFn<T>;
  icon?: ReactNode;
  label?: string;
}

export interface KanbanCardBadge<T extends Record<string, any>> {
  field?: Accessor<T>;
  value?: ValueFn<T>;
  /** Map of raw value → Tailwind color name for the badge. */
  colors?: Record<string, string>;
}

export interface KanbanCardConfig<T extends Record<string, any>> {
  title?: Accessor<T> | ValueFn<T>;
  description?: Accessor<T> | ValueFn<T>;
  /** Field holding an image URL (rendered as an avatar). */
  avatar?: Accessor<T> | ((record: T) => string | undefined);
  badge?: KanbanCardBadge<T>;
  meta?: KanbanCardMeta<T>[];
}

export interface KanbanSchemaConfig<T extends Record<string, any>> {
  /** Record field that decides the column a card belongs to. */
  groupBy: Accessor<T>;
  /** Static columns (Variant A/C). When omitted, columns come from the backend prop. */
  columns?: KanbanColumn[];
  /** Override/augment styling of backend-provided columns by id. */
  columnStyle?: (column: KanbanColumn) => { color?: string };
  /** Allow reordering cards within a column (persists `position`). */
  sortable?: boolean;
  /** Allow dragging whole columns (UI order only). */
  columnsMovable?: boolean;
  /** Column header style: `plain` (default) or `pipeline` (chevron flow + flat terminal). */
  headerStyle?: "plain" | "pipeline";
  /** Cards may enter a `terminal` column but not leave it. Default true. */
  lockTerminal?: boolean;
  /** Unique id extractor for a record (defaults to `record.id`). */
  getItemValue?: (record: T) => string | number;
  /** Text shown in a column that has no cards. */
  emptyText?: string;
  card: KanbanCardConfig<T>;
}

export interface KanbanBuildResult<T extends Record<string, any>> {
  config: KanbanSchemaConfig<T>;
}
