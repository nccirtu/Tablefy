"use client";

import { Fragment, type ReactNode, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildItem,
  isSchemaNode,
  type SchemaItem,
  type SchemaNode,
} from "../schema/types";

const GRID_COLS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};

function SectionNode({ node }: { node: SchemaNode }) {
  const props = node.props as {
    title?: string;
    description?: string;
    collapsible?: boolean;
    collapsed?: boolean;
  };
  const [open, setOpen] = useState(!props.collapsed);
  const hasHeader = !!(props.title || props.description);

  return (
    <Card>
      {hasHeader && (
        <CardHeader
          className={props.collapsible ? "cursor-pointer" : undefined}
          onClick={props.collapsible ? () => setOpen((o) => !o) : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {props.title && <CardTitle>{props.title}</CardTitle>}
              {props.description && (
                <CardDescription>{props.description}</CardDescription>
              )}
            </div>
            {props.collapsible && (
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform",
                  open ? "" : "-rotate-90",
                )}
              />
            )}
          </div>
        </CardHeader>
      )}
      {open && (
        <CardContent className="flex flex-col gap-4">
          <SchemaRenderer items={node.children} />
        </CardContent>
      )}
    </Card>
  );
}

function NodeRenderer({ node }: { node: SchemaNode }) {
  switch (node.type) {
    case "grid": {
      const columns = (node.props as { columns?: number }).columns ?? 1;
      return (
        <div
          className={cn(
            "grid grid-cols-1 gap-4",
            GRID_COLS[columns] ?? "md:grid-cols-2",
          )}
        >
          <SchemaRenderer items={node.children} />
        </div>
      );
    }
    case "section":
      return <SectionNode node={node} />;
    default:
      return null;
  }
}

// Guards against accidental non-renderable values (e.g. a stray `{}` from a
// commented-out JSX leaf, or a `false` from a conditional) so one bad item does
// not crash the whole tree.
function isRenderable(item: unknown): boolean {
  if (item == null || typeof item === "boolean") return false;
  if (typeof item === "object" && !Array.isArray(item)) {
    return (item as { $$typeof?: unknown }).$$typeof != null;
  }
  return true;
}

/** Renders an already-built schema item list (used by TablefyPage + TablefySchema). */
export function SchemaRenderer({ items }: { items: SchemaItem[] }) {
  return (
    <>
      {items.map((item, index) => {
        if (isSchemaNode(item)) {
          return (
            <Fragment key={index}>
              <NodeRenderer node={item} />
            </Fragment>
          );
        }
        if (!isRenderable(item)) return null;
        return <Fragment key={index}>{item as ReactNode}</Fragment>;
      })}
    </>
  );
}

export interface TablefySchemaProps {
  /** Layout builders (`Grid`, `Section`) and/or your React components. */
  schema: unknown[];
  className?: string;
}

/**
 * Renders a nested layout schema (`Grid`/`Section`/JSX) without any page chrome
 * — the same recursive renderer `TablefyPage` uses for its body. Use it anywhere
 * you want schema-driven layout: inside tabs, cards, custom panels, etc.
 *
 *   <TablefySchema schema={[ Section.make("Users").schema([ <DataTable … /> ]) ]} />
 */
export function TablefySchema({ schema, className }: TablefySchemaProps) {
  const items = schema.map(buildItem);
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <SchemaRenderer items={items} />
    </div>
  );
}
