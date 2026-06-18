"use client";
import React, { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export interface TablefyViewItem {
  value: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  /** false → the view (and its toggle button) is hidden. Default true. */
  enabled?: boolean;
}

export interface TablefyViewsProps {
  views: TablefyViewItem[];
  /** Initially active view value (defaults to the first enabled view). */
  defaultView?: string;
  /** Extra content rendered to the right of the toggle (e.g. filters). */
  toolbar?: ReactNode;
  className?: string;
}

/**
 * Declarative view switcher (shadcn ButtonGroup). Renders a toggle for each
 * enabled view and the active view's content. With a single enabled view the
 * toggle is omitted — so e.g. a Kanban view's button appears only when the
 * backend enabled it (pass `enabled={useKanbanEnabled()}`).
 */
export function TablefyViews({
  views,
  defaultView,
  toolbar,
  className,
}: TablefyViewsProps): ReactNode {
  const available = views.filter((v) => v.enabled !== false);
  const [active, setActive] = useState<string>(
    defaultView ?? available[0]?.value,
  );
  const current =
    available.find((v) => v.value === active) ?? available[0];

  return (
    <div className={className}>
      {(available.length > 1 || toolbar) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {available.length > 1 ? (
            <ButtonGroup>
              {available.map((v) => (
                <Button
                  key={v.value}
                  type="button"
                  size="sm"
                  variant={current?.value === v.value ? "default" : "outline"}
                  onClick={() => setActive(v.value)}
                >
                  {v.icon}
                  {v.label}
                </Button>
              ))}
            </ButtonGroup>
          ) : (
            <span />
          )}
          {toolbar}
        </div>
      )}
      {current?.content}
    </div>
  );
}
