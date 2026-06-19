import React, { ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KanbanItem } from "@/components/ui/kanban";
import { CardBody } from "../../card/card-body";
import type { CardBuildResult } from "../../card/types";

export interface KanbanCardProps<T extends Record<string, any>> {
  record: T;
  value: string | number;
  card: CardBuildResult<T>;
  /** Show a grip icon as a drag affordance (the whole card is draggable). */
  showGrip?: boolean;
}

export function KanbanCard<T extends Record<string, any>>({
  record,
  value,
  card,
  showGrip = true,
}: KanbanCardProps<T>): ReactNode {
  // Whole card is the drag handle (asHandle); the grip is a visual cue only.
  const grip =
    showGrip && !card.config.actions?.length ? (
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
    ) : undefined;

  return (
    <KanbanItem value={value} asHandle>
      <Card>
        <CardBody
          schema={card}
          record={record}
          imageVariant="avatar"
          trailing={grip}
        />
      </Card>
    </KanbanItem>
  );
}
