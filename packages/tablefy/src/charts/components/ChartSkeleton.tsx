import React, { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder chart card shown while the deferred chart data resolves. */
export function ChartSkeleton({
  height = 250,
  className,
}: {
  height?: number;
  className?: string;
}): ReactNode {
  return (
    <Card className={className}>
      <CardHeader className="gap-1">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full" style={{ height }} />
      </CardContent>
    </Card>
  );
}
