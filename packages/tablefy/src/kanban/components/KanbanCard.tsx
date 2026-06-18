import React, { ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KanbanItem } from "@/components/ui/kanban";
import { DropdownActions } from "../../columns/row-actions";
import { KanbanCardConfig } from "../types";
import { getByPath, resolveSlot } from "../utils";

/**
 * The visual body of a card (no drag wrapper) — shared by the draggable card
 * and the drag overlay clone.
 */
export function KanbanCardBody<T extends Record<string, any>>({
  record,
  card,
  handle,
  footer,
}: {
  record: T;
  card: KanbanCardConfig<T>;
  handle?: ReactNode;
  footer?: ReactNode;
  /** Reserved for the drag-overlay clone (no extra styling applied). */
  dragging?: boolean;
}): ReactNode {
  const title = resolveSlot(record, card.title);
  const description = resolveSlot(record, card.description);
  const avatarUrl = resolveSlot(record, card.avatar) as string | undefined;

  let badgeNode: ReactNode = null;
  if (card.badge) {
    const raw = card.badge.value
      ? card.badge.value(record)
      : getByPath(record, card.badge.field as string);
    if (raw !== undefined && raw !== null && raw !== "") {
      badgeNode = <Badge variant="secondary">{raw as ReactNode}</Badge>;
    }
  }

  const hasMeta = badgeNode || (card.meta && card.meta.length > 0);

  // Card chrome/typography come from the vendored primitives (+ stylesheet);
  // only structural layout wrappers are added here.
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            )}
            <CardTitle>{title as ReactNode}</CardTitle>
          </div>
          {handle}
        </div>
        {description != null && description !== "" && (
          <CardDescription>{description as ReactNode}</CardDescription>
        )}
      </CardHeader>

      {hasMeta && (
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {badgeNode}
            {card.meta?.map((m, i) => {
              const v = m.value
                ? m.value(record)
                : getByPath(record, m.field as string);
              if (v == null || v === "") return null;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                >
                  {m.icon}
                  {m.label ? `${m.label}: ` : ""}
                  {v as ReactNode}
                </span>
              );
            })}
          </div>
        </CardContent>
      )}

      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}

export interface KanbanCardProps<T extends Record<string, any>> {
  record: T;
  value: string | number;
  card: KanbanCardConfig<T>;
  /** Show a grip icon as a drag affordance (the whole card is draggable). */
  showGrip?: boolean;
  footer?: ReactNode;
}

export function KanbanCard<T extends Record<string, any>>({
  record,
  value,
  card,
  showGrip = true,
  footer,
}: KanbanCardProps<T>): ReactNode {
  // The whole card is the drag handle (asHandle); the grip is a visual cue only.
  const hasActions = !!card.actions && card.actions.length > 0;
  const handle = hasActions ? (
    // stopPropagation so opening the menu doesn't start a drag.
    <span
      className="-mr-1 -mt-1 shrink-0"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <DropdownActions record={record} actions={card.actions!} />
    </span>
  ) : showGrip ? (
    <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
  ) : undefined;

  return (
    <KanbanItem value={value} asHandle>
      <KanbanCardBody record={record} card={card} footer={footer} handle={handle} />
    </KanbanItem>
  );
}
