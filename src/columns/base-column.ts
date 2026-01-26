import { ColumnDef } from "@tanstack/react-table";
import { BaseColumnConfig } from "./types";

export abstract class BaseColumn<
  TData,
  TConfig extends BaseColumnConfig<TData>,
> {
  protected config: TConfig;

  constructor(accessor: keyof TData | string) {
    this.config = {
      accessor,
      sortable: false,
      searchable: false,
      hidden: false,
      align: "left",
    } as TConfig;
  }

  // Fluent API Methods
  label(label: string): this {
    this.config.label = label;
    return this;
  }

  sortable(sortable = true): this {
    this.config.sortable = sortable;
    return this;
  }

  searchable(searchable = true): this {
    this.config.searchable = searchable;
    return this;
  }

  hidden(hidden = true): this {
    this.config.hidden = hidden;
    return this;
  }

  visibleByDefault(visible = true): this {
    this.config.visibleByDefault = visible;
    return this;
  }

  visibilityLabel(label: string): this {
    this.config.visibilityLabel = label;
    return this;
  }

  alignLeft(): this {
    this.config.align = "left";
    return this;
  }

  alignCenter(): this {
    this.config.align = "center";
    return this;
  }

  alignRight(): this {
    this.config.align = "right";
    return this;
  }

  width(width: string | number): this {
    this.config.width = width;
    return this;
  }

  className(className: string): this {
    this.config.className = className;
    return this;
  }

  headerClassName(className: string): this {
    this.config.headerClassName = className;
    return this;
  }

  cellClassName(className: string): this {
    this.config.cellClassName = className;
    return this;
  }

  // Abstract method - jede Column-Art implementiert das selbst
  abstract build(): ColumnDef<TData, unknown>;

  // Hilfsfunktion für Alignment-Klassen
  protected getAlignmentClass(): string {
    const baseClasses = "text-sm text-muted-foreground";
    switch (this.config.align) {
      case "center":
        return `${baseClasses} text-center`;
      case "right":
        return `${baseClasses} text-right`;
      default:
        return `${baseClasses} text-left`;
    }
  }
}
