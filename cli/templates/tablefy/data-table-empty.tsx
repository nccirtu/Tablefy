"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyStateConfig } from "@nccirtu/tablefy";

interface DataTableEmptyProps {
  config: EmptyStateConfig;
  colSpan: number;
  className?: string;
}

export function DataTableEmpty({
  config,
  colSpan,
  className,
}: DataTableEmptyProps) {
  const { icon, imageUrl, title, description, action, variant } = config;

  return (
    <tr>
      <td colSpan={colSpan} className={cn("h-[400px]", className)}>
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center p-8">
          {imageUrl ? (
            <img className="w-24 h-24" src={imageUrl} alt="Empty State" />
          ) : icon ? (
            <div
              className={cn(
                "rounded-full p-4",
                variant === "error" ? "bg-destructive/10" : "bg-muted",
              )}
            >
              {icon}
            </div>
          ) : null}

          <div className="w-full flex flex-col items-center justify-center gap-2">
            <h3 className="text-sm font-semibold text-foreground whitespace-normal break-words">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground font-normal whitespace-normal break-words leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {action && (
            <Button
              variant={variant === "error" ? "outline" : "default"}
              onClick={action.onClick}
              asChild={!!action.href}
              className="mt-2"
            >
              {action.href ? (
                <a href={action.href}>
                  {action.icon}
                  <span className={cn(action.icon ? "ml-2" : "")}>
                    {action.label}
                  </span>
                </a>
              ) : (
                <>
                  {action.icon}
                  <span className={cn(action.icon ? "ml-2" : "")}>
                    {action.label}
                  </span>
                </>
              )}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
