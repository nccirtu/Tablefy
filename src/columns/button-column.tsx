"use client";
import React from "react";
import { Button } from "@/components/ui/button";

interface ButtonColumnConfig {
  accessorKey?: string;
  header?: string;
  label?: string;
  onClick?: (data: any) => void;
}

export const ButtonColumn = (config: ButtonColumnConfig) => {
  const accessorKey = config.accessorKey || "button";
  return {
    accessorKey,
    header: config.header || "Button",
    cell: ({ row }: { row: any }) => {
      const value = row.getValue(accessorKey);
      return (
        <Button onClick={() => config.onClick && config.onClick(row.original)}>
          {value || config.label || "Click"}
        </Button>
      );
    },
  };
};

export { ButtonColumn as buttonColumn };
