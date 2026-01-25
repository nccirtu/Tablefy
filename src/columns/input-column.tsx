"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { BaseColumn } from "./base-column";
import { BaseColumnConfig } from "./types";

interface InputColumnConfig<TData> extends BaseColumnConfig<TData> {
  placeholder?: string;
  type?: "text" | "email" | "number" | "password" | "url";
  disabled?: boolean | ((row: TData) => boolean);
  onSave?: (row: TData, newValue: string) => void;
  onChange?: (row: TData, newValue: string) => void;
  debounce?: number;
}

export class InputColumn<TData> extends BaseColumn<
  TData,
  InputColumnConfig<TData>
> {
  constructor(accessor: keyof TData | string) {
    super(accessor);
    const config = this.config as InputColumnConfig<TData>;
    config.type = "text";
    config.disabled = false;
  }

  static make<TData>(accessor: keyof TData | string): InputColumn<TData> {
    return new InputColumn(accessor);
  }

  placeholder(placeholder: string): this {
    (this.config as InputColumnConfig<TData>).placeholder = placeholder;
    return this;
  }

  type(type: "text" | "email" | "number" | "password" | "url"): this {
    (this.config as InputColumnConfig<TData>).type = type;
    return this;
  }

  disabled(disabled: boolean | ((row: TData) => boolean)): this {
    (this.config as InputColumnConfig<TData>).disabled = disabled;
    return this;
  }

  onSave(handler: (row: TData, newValue: string) => void): this {
    (this.config as InputColumnConfig<TData>).onSave = handler;
    return this;
  }

  onChange(handler: (row: TData, newValue: string) => void): this {
    (this.config as InputColumnConfig<TData>).onChange = handler;
    return this;
  }

  debounce(ms: number): this {
    (this.config as InputColumnConfig<TData>).debounce = ms;
    return this;
  }

  // Shortcuts
  email(): this {
    return this.type("email");
  }

  number(): this {
    return this.type("number");
  }

  password(): this {
    return this.type("password");
  }

  url(): this {
    return this.type("url");
  }

  build(): ColumnDef<TData, unknown> {
    const config = this.config as InputColumnConfig<TData>;
    const {
      accessor,
      label,
      sortable,
      placeholder,
      type,
      disabled,
      onSave,
      onChange,
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
      cell: ({ getValue, row }) => {
        const value = getValue() as string;
        const isDisabled =
          typeof disabled === "function" ? disabled(row.original) : disabled;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const newValue = e.target.value;
          if (onChange) {
            onChange(row.original, newValue);
          }
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          const newValue = e.target.value;
          if (onSave && newValue !== value) {
            onSave(row.original, newValue);
          }
        };

        return (
          <Input
            type={type || "text"}
            value={value || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={isDisabled}
            className={cn("h-8", this.config.cellClassName)}
          />
        );
      },
    };
  }
}

export { InputColumn as inputColumn };
