import { LayoutComponent } from "./component";
import type { SchemaNode } from "./types";

/** Responsive grid container. `Grid.make(3).schema([...])`. */
export class Grid extends LayoutComponent {
  private columnCount = 1;

  static make(columns = 1): Grid {
    const grid = new Grid();
    grid.columnCount = columns;
    return grid;
  }

  build(): SchemaNode {
    return {
      __tablefy: "node",
      type: "grid",
      props: { columns: this.columnCount },
      children: this.buildChildren(),
    };
  }
}

/** Titled card container. `Section.make("Titel").description(...).collapsible().schema([...])`. */
export class Section extends LayoutComponent {
  private sectionTitle?: string;
  private sectionDescription?: string;
  private isCollapsible = false;
  private startCollapsed = false;

  static make(title?: string): Section {
    const section = new Section();
    section.sectionTitle = title;
    return section;
  }

  description(text: string): this {
    this.sectionDescription = text;
    return this;
  }

  collapsible(value = true): this {
    this.isCollapsible = value;
    return this;
  }

  collapsed(value = true): this {
    this.startCollapsed = value;
    this.isCollapsible = true;
    return this;
  }

  build(): SchemaNode {
    return {
      __tablefy: "node",
      type: "section",
      props: {
        title: this.sectionTitle,
        description: this.sectionDescription,
        collapsible: this.isCollapsible,
        collapsed: this.startCollapsed,
      },
      children: this.buildChildren(),
    };
  }
}
