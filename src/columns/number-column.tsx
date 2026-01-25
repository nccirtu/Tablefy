import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { BaseColumn } from "./base-column";
import { BaseColumnConfig } from "./types";

interface NumberColumnConfig<TData> extends BaseColumnConfig<TData> {
  decimals?: number;
  locale?: string;
  currency?: string;
  percent?: boolean;
  prefix?: string;
  suffix?: string;
}

export class NumberColumn<TData> extends BaseColumn<
  TData,
  NumberColumnConfig<TData>
> {
  constructor(accessor: keyof TData | string) {
    super(accessor);
    this.config.align = "right"; // Zahlen standardmäßig rechtsbündig
    (this.config as NumberColumnConfig<TData>).decimals = 0;
    (this.config as NumberColumnConfig<TData>).locale = "de-DE";
  }

  static make<TData>(accessor: keyof TData | string): NumberColumn<TData> {
    return new NumberColumn(accessor);
  }

  decimals(decimals: number): this {
    (this.config as NumberColumnConfig<TData>).decimals = decimals;
    return this;
  }

  locale(locale: string): this {
    (this.config as NumberColumnConfig<TData>).locale = locale;
    return this;
  }

  // Währungsformatierung
  money(currency = "EUR"): this {
    (this.config as NumberColumnConfig<TData>).currency = currency;
    (this.config as NumberColumnConfig<TData>).decimals = 2;
    return this;
  }

  // Prozentformatierung
  percent(): this {
    (this.config as NumberColumnConfig<TData>).percent = true;
    return this;
  }

  prefix(prefix: string): this {
    (this.config as NumberColumnConfig<TData>).prefix = prefix;
    return this;
  }

  suffix(suffix: string): this {
    (this.config as NumberColumnConfig<TData>).suffix = suffix;
    return this;
  }

  build(): ColumnDef<TData, unknown> {
    const config = this.config as NumberColumnConfig<TData>;
    const {
      accessor,
      label,
      sortable,
      decimals,
      locale,
      currency,
      percent,
      prefix,
      suffix,
    } = config;

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
      cell: ({ getValue }) => {
        const value = getValue() as number;

        if (value === null || value === undefined) {
          return <span className="text-muted-foreground">—</span>;
        }

        let formatted: string;

        if (currency) {
          formatted = new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(value);
        } else if (percent) {
          formatted = new Intl.NumberFormat(locale, {
            style: "percent",
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(value / 100);
        } else {
          formatted = new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(value);
        }

        const displayValue = `${prefix || ""}${formatted}${suffix || ""}`;

        return (
          <span
            className={cn(
              "tabular-nums",
              this.getAlignmentClass(),
              this.config.cellClassName,
            )}
          >
            {displayValue}
          </span>
        );
      },
    };
  }
}
