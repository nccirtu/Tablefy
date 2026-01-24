// lib/table/columns/badge-column.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { ReactNode } from "react";
import { BaseColumn } from "./base-column";
import { BadgeColumnConfig } from "./types";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info"
  | "muted";

interface VariantConfig {
  label?: string;
  variant?: BadgeVariant;
  className?: string;
  icon?: ReactNode;
}

export class BadgeColumn<TData> extends BaseColumn<
  TData,
  BadgeColumnConfig<TData>
> {
  static make<TData>(accessor: keyof TData | string): BadgeColumn<TData> {
    return new BadgeColumn(accessor);
  }

  // Varianten definieren
  variants(variants: Record<string, VariantConfig>): this {
    this.config.variants = variants;
    return this;
  }

  // Shortcut für Boolean-Felder
  boolean(trueLabel = "Ja", falseLabel = "Nein"): this {
    this.config.variants = {
      true: { label: trueLabel, variant: "default", className: "bg-green-500" },
      false: { label: falseLabel, variant: "secondary" },
    };
    return this;
  }

  // Shortcut für Status-Felder
  status(statuses: Record<string, { label: string; color: string }>): this {
    const variants: Record<string, VariantConfig> = {};
    for (const [key, config] of Object.entries(statuses)) {
      variants[key] = {
        label: config.label,
        variant: "outline",
        className: config.color,
      };
    }
    this.config.variants = variants;
    return this;
  }

  build(): ColumnDef<TData, unknown> {
    const { accessor, label, sortable, variants } = this.config;

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
        const value = String(getValue());
        const variantConfig = variants?.[value];

        if (!variantConfig) {
          return (
            <Badge variant="outline" className={this.config.cellClassName}>
              {value}
            </Badge>
          );
        }

        return (
          <Badge
            variant={
              variantConfig.variant === "success" ||
              variantConfig.variant === "warning" ||
              variantConfig.variant === "info" ||
              variantConfig.variant === "muted"
                ? "default"
                : variantConfig.variant || "default"
            }
            className={cn(variantConfig.className, this.config.cellClassName)}
          >
            {variantConfig.icon}
            {variantConfig.label || value}
          </Badge>
        );
      },
    };
  }
}

