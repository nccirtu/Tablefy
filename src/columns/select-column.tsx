"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectColumnConfig {
  accessorKey?: string;
  header?: string;
  placeholder?: string;
  options: SelectOption[];
  onChange?: (data: any, value: string) => void;
}

export const SelectColumn = (config: SelectColumnConfig) => {
  const accessorKey = config.accessorKey || "select";
  return {
    accessorKey,
    header: config.header || "Select",
    cell: ({ row }: { row: any }) => {
      const value = row.getValue(accessorKey);
      return (
        <Select
          value={value || ""}
          onValueChange={(value) =>
            config.onChange && config.onChange(row.original, value)
          }
        >
          <SelectTrigger>
            <SelectValue
              placeholder={config.placeholder || "Select an option"}
            />
          </SelectTrigger>
          <SelectContent>
            {config.options.map((option: SelectOption, index: number) => (
              <SelectItem key={index} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  };
};

export { SelectColumn as selectColumn };

