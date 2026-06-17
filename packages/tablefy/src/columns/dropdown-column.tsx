"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DropdownOption {
  label: string;
  onClick?: (data: any) => void;
}

interface DropdownColumnConfig {
  accessorKey?: string;
  header?: string;
  options: DropdownOption[];
}

export const DropdownColumn = (config: DropdownColumnConfig) => {
  const accessorKey = config.accessorKey || "dropdown";
  return {
    accessorKey,
    header: config.header || "Options",
    cell: ({ row }: { row: any }) => {
      const value = row.getValue(accessorKey);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{value || "Options"}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {config.options.map((option: DropdownOption, index: number) => (
              <DropdownMenuItem
                key={index}
                onClick={() => option.onClick && option.onClick(row.original)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };
};

export { DropdownColumn as dropdownColumn };

