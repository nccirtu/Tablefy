"use client";
import { usePage } from "@inertiajs/react";

/**
 * True when the backend exposed a Kanban config (`kanban` page prop). Use it to
 * conditionally show a Kanban view/toggle only where the controller enabled it:
 *
 *   <TablefyViews views={[ …, { value: "kanban", enabled: useKanbanEnabled(), … } ]} />
 */
export function useKanbanEnabled(prop = "kanban"): boolean {
  const page = usePage();
  const config = page.props[prop] as { enabled?: boolean } | undefined;
  return !!config?.enabled;
}
