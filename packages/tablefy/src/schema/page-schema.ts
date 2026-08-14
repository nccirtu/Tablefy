import type { ReactNode } from "react";
import { buildItem, type SchemaItem } from "./types";
import type { ConfirmOptions, FormSchemaInput } from "../dialog/types";

/** Open a schema form in a modal from a page/header action (no row → static). */
export interface PageFormConfig {
  title?: string;
  description?: string;
  schema: FormSchemaInput<never>;
  method?: "post" | "put" | "patch";
  url: string;
  data?: Record<string, unknown>;
  submitLabel?: string;
  onSuccess?: () => void;
}

export interface PageAction {
  label: string;
  href?: string;
  onClick?: () => void;
  /** lucide icon name (e.g. "plus") or a React node. */
  icon?: string | ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  /** Confirm before running onClick/href. */
  confirm?: boolean | ConfirmOptions;
  /** Open a form dialog (e.g. "Neu" → create modal). */
  form?: PageFormConfig;
}

export class PageActionsBuilder {
  private actions: PageAction[] = [];

  button(action: PageAction): this {
    this.actions.push(action);
    return this;
  }

  build(): PageAction[] {
    return this.actions;
  }
}

export interface PageBreadcrumb {
  label: string;
  href?: string;
}

/** A global search box in the page header (drives the URL `?search=`). */
export interface PageSearchConfig {
  placeholder?: string;
  /** Target URL (defaults to the current path). */
  url?: string;
  /** Query param name (default "search"). */
  paramName?: string;
  /** Partial-reload only these props (e.g. ["orders", "kanbanColumns"]). */
  only?: string[];
  /** Debounce in ms (default 300). */
  debounce?: number;
}

export interface PageConfig {
  title?: string;
  description?: string;
  breadcrumbs?: PageBreadcrumb[];
  actions?: PageAction[];
  search?: PageSearchConfig;
  content: SchemaItem[];
}

export interface PageBuildResult {
  config: PageConfig;
}

/**
 * Page layout schema (Filament-style). Header methods (title/description/
 * breadcrumbs/headerActions) + a nested `.schema([...])` body of layout
 * components (Grid, Section) and/or your own React components.
 */
export class PageSchema {
  private config: PageConfig = { content: [] };

  static make(): PageSchema {
    return new PageSchema();
  }

  title(text: string): this {
    this.config.title = text;
    return this;
  }

  description(text: string): this {
    this.config.description = text;
    return this;
  }

  breadcrumbs(items: PageBreadcrumb[]): this {
    this.config.breadcrumbs = items;
    return this;
  }

  headerActions(fn: (builder: PageActionsBuilder) => PageActionsBuilder): this {
    this.config.actions = fn(new PageActionsBuilder()).build();
    return this;
  }

  /** Global search box next to the title; updates `?search=` (table + kanban read it). */
  search(config: PageSearchConfig = {}): this {
    this.config.search = config;
    return this;
  }

  /** The nested page body: layout builders and/or your React components. */
  schema(items: unknown[]): this {
    this.config.content = items.map(buildItem);
    return this;
  }

  build(): PageBuildResult {
    return { config: this.config };
  }
}
