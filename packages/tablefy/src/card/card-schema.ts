import { ActionsColumn } from "../columns/actions-column";
import { CardRow } from "./card-row";
import { CardBadge, CardBuildResult, CardCell, CardSchemaConfig } from "./types";
import type { FilterConfig, HeaderAction, SearchConfig } from "../types";

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

  /** Badges under the heading — count, origin, status. */
  badges(badges: CardBadge<T>[]): this {
    this.config.badges = badges;
    return this;
  }

  /** Make the whole card a link. */
  href(fn: (record: T) => string): this {
    this.config.href = fn;
    return this;
  }

  /** Drop the card frame — image, heading and badges only. */
  plain(plain = true): this {
    this.config.plain = plain;
    return this;
  }

  // --- the header above the grid: same names as TableSchema ---

  title(text: string): this {
    this.config.title = text;
    return this;
  }

  description(text: string): this {
    this.config.description = text;
    return this;
  }

  headerActions(actions: HeaderAction<T>[]): this {
    this.config.headerActions = actions;
    return this;
  }

  searchable(config?: { placeholder?: string } | boolean): this {
    this.config.search =
      config === false
        ? { enabled: false }
        : { enabled: true, ...(typeof config === "object" ? config : {}) };
    return this;
  }

  filters(...filters: FilterConfig[]): this {
    this.config.filters = filters;
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
