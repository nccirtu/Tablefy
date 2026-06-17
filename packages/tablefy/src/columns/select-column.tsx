"use client";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { BaseColumn } from "./base-column";
import { BaseColumnConfig } from "./types";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectColumnConfig<TData> extends BaseColumnConfig<TData> {
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean | ((row: TData) => boolean);
  onValueChange?: (row: TData, newValue: string) => void;
}

export class SelectColumn<TData> extends BaseColumn<
  TData,
  SelectColumnConfig<TData>
> {
  constructor(accessor: keyof TData | string) {
    super(accessor);
    const config = this.config as SelectColumnConfig<TData>;
    config.options = [];
    config.disabled = false;
  }

  static make<TData>(accessor: keyof TData | string): SelectColumn<TData> {
    return new SelectColumn(accessor);
  }

  options(options: SelectOption[]): this {
    (this.config as SelectColumnConfig<TData>).options = options;
    return this;
  }

  placeholder(placeholder: string): this {
    (this.config as SelectColumnConfig<TData>).placeholder = placeholder;
    return this;
  }

  disabled(disabled: boolean | ((row: TData) => boolean)): this {
    (this.config as SelectColumnConfig<TData>).disabled = disabled;
    return this;
  }

  onValueChange(handler: (row: TData, newValue: string) => void): this {
    (this.config as SelectColumnConfig<TData>).onValueChange = handler;
    return this;
  }

  build(): ColumnDef<TData, unknown> {
    const config = this.config as SelectColumnConfig<TData>;
    const {
      accessor,
      label,
      sortable,
      options,
      placeholder,
      disabled,
      onValueChange,
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
        const initialValue = getValue() as string;
        const [localValue, setLocalValue] = useState(initialValue || "");
        const isDisabled =
          typeof disabled === "function" ? disabled(row.original) : disabled;

        // Sync local value with table data when it changes externally
        useEffect(() => {
          setLocalValue(initialValue || "");
        }, [initialValue]);

        const handleValueChange = (newValue: string) => {
          setLocalValue(newValue);
          if (onValueChange) {
            onValueChange(row.original, newValue);
          }
        };

        return (
          <Select
            value={localValue}
            onValueChange={handleValueChange}
            disabled={isDisabled}
          >
            <SelectTrigger className={cn("h-8", this.config.cellClassName)}>
              <SelectValue placeholder={placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option, index) => (
                <SelectItem
                  key={index}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    };
  }
}

export { SelectColumn as selectColumn };
