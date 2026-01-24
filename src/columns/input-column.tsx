"use client";
import React from "react";
import { Input } from "@/components/ui/input";

interface InputColumnConfig {
  accessorKey?: string;
  header?: string;
  placeholder?: string;
  onChange?: (data: any, value: string) => void;
}

export const InputColumn = (config: InputColumnConfig) => {
  const accessorKey = config.accessorKey || "input";
  return {
    accessorKey,
    header: config.header || "Input",
    cell: ({ row }: { row: any }) => {
      const value = row.getValue(accessorKey);
      return (
        <Input
          value={value || ""}
          onChange={(e) =>
            config.onChange && config.onChange(row.original, e.target.value)
          }
          placeholder={config.placeholder || "Enter value"}
        />
      );
    },
  };
};

export { InputColumn as inputColumn };
