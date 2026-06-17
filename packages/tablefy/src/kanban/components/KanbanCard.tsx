import React, { ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { KanbanItem } from "@/components/ui/kanban";
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
  dragging,
}: {
  record: T;
  card: KanbanCardConfig<T>;
  handle?: ReactNode;
  footer?: ReactNode;
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

  return (
    <div
      className={cn(
        "rounded-md border bg-card p-3 shadow-sm transition-shadow",
        dragging && "rotate-2 shadow-lg ring-1 ring-primary/30",
      )}
    >
      <div className="flex items-start gap-2">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt=""
            className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-medium">{title as ReactNode}</p>
            {handle}
          </div>
          {description != null && description !== "" && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {description as ReactNode}
            </p>
          )}
        </div>
      </div>

      {(badgeNode || (card.meta && card.meta.length > 0)) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {badgeNode}
          {card.meta?.map((m, i) => {
            const v = m.value ? m.value(record) : getByPath(record, m.field as string);
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
      )}

      {footer && <div className="mt-2 flex items-center gap-1">{footer}</div>}
    </div>
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
  return (
    <KanbanItem value={value} asHandle>
      <KanbanCardBody
        record={record}
        card={card}
        footer={footer}
        handle={
          showGrip ? (
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
          ) : undefined
        }
      />
    </KanbanItem>
  );
}
