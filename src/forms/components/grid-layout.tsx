import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GridLayoutProps {
  columns?: number;
  children: ReactNode;
  className?: string;
}

const gridColsClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function GridLayout({
  columns = 1,
  children,
  className,
}: GridLayoutProps): ReactNode {
  return (
    <div
      className={cn(
        "grid gap-4",
        gridColsClass[columns] || gridColsClass[1],
        className,
      )}
    >
      {children}
    </div>
  );
}
