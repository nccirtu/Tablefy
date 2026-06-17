import { buildItem, type SchemaItem, type SchemaNode } from "./types";

/**
 * Base for layout components (Grid, Section, …). Holds a nested child schema
 * and builds its children recursively.
 */
export abstract class LayoutComponent {
  protected childItems: unknown[] = [];

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
