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
      props: this.layoutProps({ columns: this.columnCount }),
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
      props: this.layoutProps({
        title: this.sectionTitle,
        description: this.sectionDescription,
        collapsible: this.isCollapsible,
        collapsed: this.startCollapsed,
      }),
      children: this.buildChildren(),
    };
  }
}

/**
 * One tab inside a `Tabs` container.
 *
 * `lazy` names the Inertia prop that carries this tab's data. The tab then
 * loads it on first activation (`router.reload({ only: [prop] })`) instead of
 * every tab's data riding along on the first response — which is what makes a
 * five-tab screen affordable.
 */
export class Tab extends LayoutComponent {
  private tabValue?: string;

  private tabLabel = "";

  private tabIcon?: string;

  private tabBadge?: string | number;

  private lazyProps?: string[];

  static make(label: string, value?: string): Tab {
    const tab = new Tab();
    tab.tabLabel = label;
    tab.tabValue = value;
    return tab;
  }

  /** Icon name, as the actions take them. */
  icon(name: string): this {
    this.tabIcon = name;
    return this;
  }

  /** A count or short marker next to the label. */
  badge(value: string | number): this {
    this.tabBadge = value;
    return this;
  }

  /**
   * Load these Inertia props when the tab is first opened. Usually one — the
   * tab's list — but a tab whose form needs a picker names that prop too, so
   * both arrive in the same request instead of the form opening empty.
   */
  lazy(...props: string[]): this {
    this.lazyProps = props;
    return this;
  }

  build(): SchemaNode {
    return {
      __tablefy: "node",
      type: "tab",
      props: {
        value: this.tabValue ?? slugify(this.tabLabel),
        label: this.tabLabel,
        icon: this.tabIcon,
        badge: this.tabBadge,
        lazy: this.lazyProps,
      },
      children: this.buildChildren(),
    };
  }
}

/**
 * Tab container. `Tabs.make().schema([Tab.make("Räume")…])`.
 *
 * The active tab is kept in the URL (`?tab=…` by default), so a reload — and
 * every write that redirects back — returns to the tab the user was on.
 */
export class Tabs extends LayoutComponent {
  private queryKey = "tab";

  private defaultValue?: string;

  static make(): Tabs {
    return new Tabs();
  }

  /** Query parameter carrying the active tab. `false` keeps it out of the URL. */
  queryParameter(key: string | false): this {
    this.queryKey = key === false ? "" : key;
    return this;
  }

  default(value: string): this {
    this.defaultValue = value;
    return this;
  }

  build(): SchemaNode {
    return {
      __tablefy: "node",
      type: "tabs",
      props: { queryKey: this.queryKey, default: this.defaultValue },
      children: this.buildChildren(),
    };
  }
}

/** Label → URL-safe value, for tabs that do not name one. */
function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
