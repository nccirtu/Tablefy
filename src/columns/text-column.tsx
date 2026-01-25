import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { BaseColumn } from "./base-column";
import { FormattedColumnConfig } from "./types";

export class TextColumn<TData> extends BaseColumn<
  TData,
  FormattedColumnConfig<TData>
> {
  static make<TData>(accessor: keyof TData | string): TextColumn<TData> {
    return new TextColumn(accessor);
  }

  formatter(fn: (value: unknown, row: Row<TData>) => React.ReactNode): this {
    this.config.formatter = fn;
    return this;
  }

  prefix(prefix: string): this {
    this.config.prefix = prefix;
    return this;
  }

  suffix(suffix: string): this {
    this.config.suffix = suffix;
    return this;
  }

  placeholder(placeholder: string): this {
    this.config.placeholder = placeholder;
    return this;
  }

  // Shortcuts für gängige Formatierungen
  uppercase(): this {
    const existingFormatter = this.config.formatter;
    this.config.formatter = (value, row): React.ReactNode => {
      const result = existingFormatter ? existingFormatter(value, row) : value;
      return typeof result === "string"
        ? result.toUpperCase()
        : (result as React.ReactNode);
    };
    return this;
  }

  lowercase(): this {
    const existingFormatter = this.config.formatter;
    this.config.formatter = (value, row): React.ReactNode => {
      const result = existingFormatter ? existingFormatter(value, row) : value;
      return typeof result === "string"
        ? result.toLowerCase()
        : (result as React.ReactNode);
    };
    return this;
  }

  limit(chars: number): this {
    const existingFormatter = this.config.formatter;
    this.config.formatter = (value, row): React.ReactNode => {
      const result = existingFormatter ? existingFormatter(value, row) : value;
      if (typeof result === "string" && result.length > chars) {
        return result.slice(0, chars) + "...";
      }
      return result as React.ReactNode;
    };
    return this;
  }

  build(): ColumnDef<TData, unknown> {
    const {
      accessor,
      label,
      sortable,
      prefix,
      suffix,
      placeholder,
      formatter,
    } = this.config;

    return {
      accessorKey: accessor as string,
      header: ({ column }) => {
        const displayLabel = label || String(accessor);

        if (!sortable) {
          return (
            <span
              className={cn(
                "text-muted-foreground font-medium",
                this.getAlignmentClass(),
                this.config.headerClassName,
              )}
            >
              {displayLabel}
            </span>
          );
        }

        return (
          <Button
            variant="table_header"
            size="table_header"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={cn(
              "text-muted-foreground font-medium",
              this.getAlignmentClass(),
              this.config.headerClassName,
            )}
          >
            {displayLabel}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row, getValue }) => {
        let value = getValue();

        // Custom Formatter anwenden
        if (formatter) {
          value = formatter(value, row);
        }

        // Placeholder wenn leer
        if (value === null || value === undefined || value === "") {
          return (
            <span
              className={cn(
                "text-muted-foreground",
                this.getAlignmentClass(),
                this.config.cellClassName,
              )}
            >
              {placeholder || "—"}
            </span>
          );
        }

        // Prefix/Suffix hinzufügen
        const displayValue = `${prefix || ""}${value}${suffix || ""}`;

        return (
          <span
            className={cn(this.getAlignmentClass(), this.config.cellClassName)}
          >
            {displayValue}
          </span>
        );
      },
    };
  }
}
