"use client";
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DropdownActions } from "../columns/row-actions";
import { getByPath } from "../kanban/utils";
import { renderCellValue } from "./render-cell";
import { Badge } from "@/components/ui/badge";
import { CardBuildResult } from "./types";

export interface CardBodyProps<T extends Record<string, any>> {
  schema: CardBuildResult<T>;
  record: T;
  /** cover = image on top (grid), avatar = small image beside the title (kanban). */
  imageVariant?: "cover" | "avatar" | "none";
  /** Top-right control when there are no actions (e.g. the kanban drag grip). */
  trailing?: ReactNode;
  /** No card frame: image, heading and badges only — a catalogue tile. */
  bare?: boolean;
  className?: string;
}

/**
 * Renders a card's inner content from a shared CardSchema (image + heading +
 * rows of table-column cells + actions). The outer <Card> is provided by each
 * view (kanban / grid).
 */
export function CardBody<T extends Record<string, any>>({
  schema,
  record,
  imageVariant = "cover",
  trailing,
  bare = false,
  className,
}: CardBodyProps<T>): ReactNode {
  const { config } = schema;
  const imageUrl = config.image
    ? typeof config.image === "function"
      ? config.image(record)
      : getByPath(record, config.image as string)
    : undefined;
  const heading = config.heading
    ? renderCellValue(config.heading, record)
    : null;

  const trailingEl =
    config.actions && config.actions.length > 0 ? (
      // stopPropagation so opening the menu doesn't start a kanban drag.
      <span
        className="shrink-0"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownActions
          record={record}
          actions={config.actions}
          triggerClassName="-mr-1 -mt-1"
        />
      </span>
    ) : (
      trailing
    );

  const hasHeaderRow =
    heading || trailingEl || (imageVariant === "avatar" && imageUrl);

  // Compact: name over a subline on a tinted ground, and a corner flag for a
  // record that is not one of ours. No picture — a long catalogue reads as a
  // list, not as a wall of images.
  if (config.compact) {
    return (
      <div
        className={cn(
          "relative flex items-center gap-4 overflow-hidden rounded-md bg-detail-surface p-3 transition-shadow hover:shadow-md",
          className,
        )}
      >
        {config.flagged?.(record) && (
          <span
            aria-hidden="true"
            className="absolute right-0 top-0 h-0 w-0 border-l-[22px] border-t-[22px] border-l-transparent border-t-success"
          />
        )}
        <div className="min-w-0 grow space-y-1">
          {heading && (
            <p className="truncate text-xs font-medium leading-none">
              {heading}
            </p>
          )}
          {config.subline && (
            <p className="truncate text-xs text-muted-foreground">
              {renderCellValue(config.subline, record)}
            </p>
          )}
        </div>
        {trailingEl}
      </div>
    );
  }

  return (
    // Bare tiles space picture and text; a framed card lets its padding do it.
    <div className={cn(bare && "flex flex-col gap-3", className)}>
      {imageVariant === "cover" && imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className={cn(
            "w-full object-cover",
            bare
              ? "aspect-4/3 rounded-md transition-transform group-hover:scale-105"
              : "aspect-video",
          )}
        />
      )}
      <div className={cn("space-y-2", bare ? "space-y-1.5" : "p-3")}>
        {hasHeaderRow && (
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {imageVariant === "avatar" && imageUrl && (
                <img
                  src={imageUrl}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              )}
              {heading && (
                <div
                  className={cn(
                    "min-w-0 truncate leading-tight",
                    bare ? "text-sm font-semibold" : "font-medium",
                  )}
                >
                  {heading}
                </div>
              )}
            </div>
            {trailingEl}
          </div>
        )}

        {config.badges && config.badges.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {config.badges
              .filter((badge) => !badge.hidden?.(record))
              .map((badge, i) => {
                const label =
                  typeof badge.label === "function"
                    ? badge.label(record)
                    : badge.label;

                if (label === null || label === undefined || label === "") {
                  return null;
                }

                const variant =
                  typeof badge.variant === "function"
                    ? badge.variant(record)
                    : badge.variant;

                return (
                  <Badge key={i} variant={variant ?? "secondary"}>
                    {label}
                  </Badge>
                );
              })}
          </div>
        )}

        {config.rows.map((row, i) => (
          <div
            key={i}
            className="grid gap-x-3 gap-y-1"
            style={{
              gridTemplateColumns: `repeat(${row.columns ?? row.cells.length}, minmax(0,1fr))`,
            }}
          >
            {row.cells.map((cell, j) => (
              <div key={j} className="min-w-0">
                {config.withLabels !== false && cell.getLabel() && (
                  <div className="text-xs text-muted-foreground">
                    {cell.getLabel()}
                  </div>
                )}
                <div className="min-w-0 truncate">
                  {renderCellValue(cell, record)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
