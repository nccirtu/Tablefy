import React, { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder board shown while the deferred column data resolves. */
export function KanbanSkeleton({
  columns = 3,
  cardsPerColumn = 3,
  height = "60vh",
  className,
}: {
  columns?: number;
  cardsPerColumn?: number;
  height?: string;
  className?: string;
}): ReactNode {
  return (
    <div className={className}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {Array.from({ length: columns }).map((_, c) => (
          <div
            key={c}
            style={{ height }}
            className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/40 p-2"
          >
            <div className="mb-2 flex items-center gap-2 px-1">
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: cardsPerColumn }).map((_, i) => (
                <div key={i} className="rounded-md border bg-card p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
