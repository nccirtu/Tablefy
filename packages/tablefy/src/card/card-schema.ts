import { ActionsColumn } from "../columns/actions-column";
import { CardRow } from "./card-row";
import { CardBuildResult, CardCell, CardSchemaConfig } from "./types";

type ImageInput<T> = (keyof T & string) | string | ((record: T) => string | undefined);

/**
 * Shared card-content schema (used by both Kanban and the card grid). Cells are
 * the table column builders (TextColumn/BadgeColumn/…), arranged in rows.
 *
 *   CardSchema.make<T>()
 *     .image("image_url")
 *     .heading(TextColumn.make("name"))
 *     .rows([ CardRow.make([TextColumn.make("address"), BadgeColumn.make("plan")]) ])
 *     .actions((a) => a.edit(...).delete(...))
 */
export class CardSchema<T extends Record<string, any>> {
  private config: CardSchemaConfig<T> = { rows: [], withLabels: true };

  static make<T extends Record<string, any>>(): CardSchema<T> {
    return new CardSchema<T>();
  }

  image(value: ImageInput<T>): this {
    this.config.image = value;
    return this;
  }

  heading(cell: CardCell): this {
    this.config.heading = cell;
    return this;
  }

  /** Explicit layout: an array of CardRow (each row = cells side by side). */
  rows(rows: CardRow[]): this {
    this.config.rows = rows.map((r) => r.build());
    return this;
  }

  /** Grid shortcut: lay all cells out in `columns` columns (one row config). */
  cells(cells: CardCell[], columns = 1): this {
    this.config.rows = [{ cells, columns }];
    return this;
  }

  /** Show/hide the per-cell labels (key-value style). Default on. */
  withLabels(withLabels = true): this {
    this.config.withLabels = withLabels;
    return this;
  }

  actions(build: (a: ActionsColumn<T>) => ActionsColumn<T>): this {
    this.config.actions = build(ActionsColumn.make<T>()).getActions();
    return this;
  }

  getItemValue(fn: (record: T) => string | number): this {
    this.config.getItemValue = fn;
    return this;
  }

  build(): CardBuildResult<T> {
    return { config: { ...this.config } };
  }
}
