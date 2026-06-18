import {
  KanbanBuildResult,
  KanbanColumn,
  KanbanSchemaConfig,
} from "../types";
import { CardBuilder } from "./card-builder";

type Accessor<T> = (keyof T & string) | string;

/**
 * Schema for a Kanban view. Static columns live here (Variant A/C); when
 * `columns()` is omitted the renderer falls back to backend-provided columns
 * (Variant B/C dynamic).
 */
export class KanbanSchema<T extends Record<string, any>> {
  private config: KanbanSchemaConfig<T> = {
    groupBy: "" as Accessor<T>,
    sortable: false,
    columnsMovable: false,
    card: {},
  };

  static make<T extends Record<string, any>>(): KanbanSchema<T> {
    return new KanbanSchema<T>();
  }

  groupBy(field: Accessor<T>): this {
    this.config.groupBy = field;
    return this;
  }

  columns(columns: KanbanColumn[]): this {
    this.config.columns = columns;
    return this;
  }

  columnStyle(fn: (column: KanbanColumn) => { color?: string }): this {
    this.config.columnStyle = fn;
    return this;
  }

  sortable(sortable = true): this {
    this.config.sortable = sortable;
    return this;
  }

  columnsMovable(movable = true): this {
    this.config.columnsMovable = movable;
    return this;
  }

  /** `pipeline` → chevron headers for `flow` columns, flat for `terminal`. */
  headerStyle(style: "plain" | "pipeline"): this {
    this.config.headerStyle = style;
    return this;
  }

  /** Cards may enter `terminal` columns but not leave them (default true). */
  lockTerminal(lock = true): this {
    this.config.lockTerminal = lock;
    return this;
  }

  getItemValue(fn: (record: T) => string | number): this {
    this.config.getItemValue = fn;
    return this;
  }

  /** Text shown in a column with no cards (default "Keine Einträge"). */
  emptyText(text: string): this {
    this.config.emptyText = text;
    return this;
  }

  card(build: (card: CardBuilder<T>) => CardBuilder<T>): this {
    this.config.card = build(new CardBuilder<T>()).build();
    return this;
  }

  build(): KanbanBuildResult<T> {
    return { config: { ...this.config } };
  }
}
