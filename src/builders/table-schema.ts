import { ColumnDef } from "@tanstack/react-table";
import { DataTableConfig } from "../types/table";
import { HeaderAction } from "../types/actions";
import { EmptyStateConfig } from "../types/empty-state";
import { SearchConfig } from "../types/filters";
import React from "react";

type ColumnBuilder<TData> = { build(): ColumnDef<TData, unknown> };

/**
 * Table Schema Builder
 * Fluent API for building complete table configurations
 */
export class TableSchema<TData> {
  private columnBuilders: ColumnBuilder<TData>[] = [];
  private config: Partial<DataTableConfig<TData>> = {};

  static make<TData>(): TableSchema<TData> {
    return new TableSchema();
  }

  // Configuration Methods
  description(text: string): this {
    this.config.description = text;
    return this;
  }

  title(text: string): this {
    this.config.title = text;
    return this;
  }

  headerActions(actions: HeaderAction<TData>[]): this {
    this.config.headerActions = actions;
    return this;
  }

  emptyState(config: EmptyStateConfig): this {
    this.config.emptyState = config;
    return this;
  }

  searchEmptyState(config: EmptyStateConfig): this {
    this.config.searchEmptyState = config;
    return this;
  }

  filterEmptyState(config: EmptyStateConfig): this {
    this.config.filterEmptyState = config;
    return this;
  }

  // Feature Methods
  searchable(config?: { placeholder?: string } | boolean): this {
    if (typeof config === "boolean") {
      this.config.search = config ? { enabled: true } : { enabled: false };
    } else {
      this.config.search = {
        enabled: true,
        placeholder: config?.placeholder,
      };
    }
    return this;
  }

  paginated(
    config?: { pageSize?: number; pageSizeOptions?: number[] } | boolean,
  ): this {
    if (typeof config === "boolean") {
      this.config.pagination = { enabled: config };
    } else {
      this.config.pagination = {
        enabled: true,
        pageSize: config?.pageSize,
        pageSizeOptions: config?.pageSizeOptions,
      };
    }
    return this;
  }

  selectable(multiSelect: boolean = true): this {
    this.config.enableRowSelection = true;
    this.config.enableMultiRowSelection = multiSelect;
    return this;
  }

  sortable(defaultSort?: { id: string; desc: boolean }): this {
    this.config.enableSorting = true;
    if (defaultSort) {
      this.config.defaultSort = defaultSort;
    }
    return this;
  }

  columnVisibility(enabled: boolean = true): this {
    this.config.enableColumnVisibility = enabled;
    return this;
  }

  // Styling Methods
  bordered(enabled: boolean = true): this {
    this.config.bordered = enabled;
    return this;
  }

  striped(enabled: boolean = true): this {
    this.config.striped = enabled;
    return this;
  }

  hoverable(enabled: boolean = true): this {
    this.config.hoverable = enabled;
    return this;
  }

  density(density: "compact" | "default" | "comfortable"): this {
    this.config.density = density;
    return this;
  }

  // Columns
  columns(...builders: ColumnBuilder<TData>[]): this {
    this.columnBuilders.push(...builders);
    return this;
  }

  // Build
  build(): {
    columns: ColumnDef<TData, unknown>[];
    config: DataTableConfig<TData>;
  } {
    return {
      columns: this.columnBuilders.map((builder) => builder.build()),
      config: this.config as DataTableConfig<TData>,
    };
  }
}
