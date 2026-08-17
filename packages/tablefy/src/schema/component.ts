import { buildItem, type SchemaItem, type SchemaNode } from "./types";

/**
 * Base for layout components (Grid, Section, …). Holds a nested child schema
 * and builds its children recursively.
 */
export abstract class LayoutComponent {
  protected childItems: unknown[] = [];

  protected spanValue?: number;

  /**
   * How many columns of the surrounding `Grid` this takes. Ignored outside
   * one — `Grid.make(12).schema([Section.make().span(8), …])`.
   */
  span(columns: number): this {
    this.spanValue = columns;
    return this;
  }

  /** Merges the span into a node's props, so every builder carries it. */
  protected layoutProps<T extends object>(props: T): T & { span?: number } {
    return this.spanValue === undefined ? props : { ...props, span: this.spanValue };
  }

  /** The nested schema (layout builders and/or your React components). */
  schema(items: unknown[]): this {
    this.childItems = items;
    return this;
  }

  protected buildChildren(): SchemaItem[] {
    return this.childItems.map(buildItem);
  }

  abstract build(): SchemaNode;
}
