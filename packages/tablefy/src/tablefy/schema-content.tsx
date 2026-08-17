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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { renderActionIcon } from "../lib/icons";
import { router } from "@inertiajs/react";

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
    // Ohne eigenen Kopf beginnt der Inhalt sonst direkt an der Kante — die
    // Tabelle bringt ihren Kopf selbst mit und braucht denselben Abstand.
    <Card className={hasHeader ? undefined : "pt-6"}>
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

/**
 * Tab container.
 *
 * Two things it does beyond showing panels: it keeps the active tab in the URL,
 * so a reload — and every write that redirects back — returns where the user
 * was; and it loads a tab's data on first opening when the tab named a prop
 * (`Tab.lazy("services")`), instead of every tab's data riding along on the
 * first response.
 */
function TabsNode({ node }: { node: SchemaNode }) {
  const { queryKey, default: fallback } = node.props as {
    queryKey?: string;
    default?: string;
  };

  const tabs = node.children.filter(
    (child): child is SchemaNode => isSchemaNode(child) && child.type === "tab",
  );

  const values = tabs.map((tab) => String(tab.props.value));

  const fromUrl =
    typeof window !== "undefined" && queryKey
      ? new URLSearchParams(window.location.search).get(queryKey)
      : null;

  const initial =
    (fromUrl && values.includes(fromUrl) && fromUrl) ||
    (fallback && values.includes(fallback) && fallback) ||
    values[0];

  const [active, setActive] = useState<string>(initial ?? "");
  const [loaded, setLoaded] = useState<string[]>(initial ? [initial] : []);

  if (tabs.length === 0) return null;

  const activate = (value: string) => {
    setActive(value);

    const tab = tabs.find((candidate) => String(candidate.props.value) === value);
    const lazy = tab?.props.lazy as string | undefined;

    if (lazy && !loaded.includes(value)) {
      setLoaded((seen) => [...seen, value]);
      router.reload({ only: [lazy] });
    }

    if (queryKey) {
      const url = new URL(window.location.href);
      url.searchParams.set(queryKey, value);
      window.history.replaceState({}, "", url);
    }
  };

  return (
    <Tabs value={active} onValueChange={activate}>
      {/* Volle Breite, links ausgerichtet, waagerecht scrollbar — die Leiste
          ist die Überschrift des Bereichs, kein Etikett am Inhalt. */}
      <TabsList className="inline-flex h-10 w-full items-center justify-start overflow-x-auto">
        {tabs.map((tab) => (
          <TabsTrigger key={String(tab.props.value)} value={String(tab.props.value)}>
            {tab.props.icon ? renderActionIcon(tab.props.icon) : null}
            {String(tab.props.label)}
            {tab.props.badge != null && (
              <span className="ml-1 text-muted-foreground">
                {String(tab.props.badge)}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent
          key={String(tab.props.value)}
          value={String(tab.props.value)}
          className="mt-6 flex flex-col gap-4"
        >
          <SchemaRenderer items={tab.children} />
        </TabsContent>
      ))}
    </Tabs>
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
    case "tabs":
      return <TabsNode node={node} />;
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
