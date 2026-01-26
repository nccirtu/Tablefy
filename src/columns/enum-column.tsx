import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, LucideIcon } from "lucide-react";
import { BaseColumn } from "./base-column";
import { BaseColumnConfig } from "./types";

export interface EnumOption<T = string | number> {
  value: T;
  label: string;
  icon?: LucideIcon;
  color?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info";
  className?: string;
}

interface EnumColumnConfig<TData> extends BaseColumnConfig<TData> {
  options: EnumOption[];
  asBadge?: boolean;
  showIcon?: boolean;
  iconPosition?: "left" | "right";
  placeholder?: string;
}

export class EnumColumn<TData> extends BaseColumn<
  TData,
  EnumColumnConfig<TData>
> {
  constructor(accessor: keyof TData | string) {
    super(accessor);
    this.config.asBadge = true;
    this.config.showIcon = true;
    this.config.iconPosition = "left";
  }

  static make<TData>(accessor: keyof TData | string): EnumColumn<TData> {
    return new EnumColumn(accessor);
  }

  /**
   * Define the enum options with labels, icons, and colors
   */
  options(options: EnumOption[]): this {
    this.config.options = options;
    return this;
  }

  /**
   * Display as plain text instead of badge
   */
  asText(): this {
    this.config.asBadge = false;
    return this;
  }

  /**
   * Display as badge (default)
   */
  asBadge(): this {
    this.config.asBadge = true;
    return this;
  }

  /**
   * Hide icons
   */
  hideIcon(): this {
    this.config.showIcon = false;
    return this;
  }

  /**
   * Show icons (default)
   */
  showIcon(): this {
    this.config.showIcon = true;
    return this;
  }

  /**
   * Set icon position
   */
  iconPosition(position: "left" | "right"): this {
    this.config.iconPosition = position;
    return this;
  }

  /**
   * Placeholder for unknown values
   */
  placeholder(placeholder: string): this {
    this.config.placeholder = placeholder;
    return this;
  }

  build(): ColumnDef<TData, unknown> {
    const {
      accessor,
      label,
      sortable,
      options,
      asBadge,
      showIcon,
      iconPosition,
      placeholder,
    } = this.config;

    if (!options || options.length === 0) {
      throw new Error(
        `EnumColumn "${String(accessor)}" requires options to be defined`,
      );
    }

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
        const value = getValue();

        // Find matching option
        const option = options.find((opt) => opt.value === value);

        // Handle unknown values
        if (!option) {
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

        const Icon = option.icon;
        const iconElement =
          showIcon && Icon ? <Icon className="h-4 w-4" /> : null;

        // Render as Badge
        if (asBadge) {
          return (
            <div
              className={cn(
                this.getAlignmentClass(),
                this.config.cellClassName,
              )}
            >
              <Badge
                variant={option.color || "default"}
                className={cn(
                  "inline-flex items-center gap-1.5",
                  option.className,
                )}
              >
                {iconPosition === "left" && iconElement}
                {option.label}
                {iconPosition === "right" && iconElement}
              </Badge>
            </div>
          );
        }

        // Render as plain text with icon
        return (
          <div
            className={cn(
              "inline-flex items-center gap-2",
              this.getAlignmentClass(),
              this.config.cellClassName,
              option.className,
            )}
          >
            {iconPosition === "left" && iconElement}
            <span>{option.label}</span>
            {iconPosition === "right" && iconElement}
          </div>
        );
      },
    };
  }
}
