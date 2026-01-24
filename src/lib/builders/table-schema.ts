import { ColumnDef } from "@tanstack/react-table";

type ColumnBuilder<TData> = { build(): ColumnDef<TData, unknown> };

/**
 * Table Schema Builder
 * Fluent API for building table column definitions
 */
export class TableSchema<TData> {
  private columnBuilders: ColumnBuilder<TData>[] = [];

  static make<TData>(): TableSchema<TData> {
    return new TableSchema();
  }

  columns(...builders: ColumnBuilder<TData>[]): this {
    this.columnBuilders.push(...builders);
    return this;
  }

  build(): ColumnDef<TData, unknown>[] {
    return this.columnBuilders.map((builder) => builder.build());
  }
}

