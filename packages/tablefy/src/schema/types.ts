import type { ReactNode } from "react";

/** A built layout node in a page schema tree. */
export interface SchemaNode {
  __tablefy: "node";
  type: string;
  props: Record<string, unknown>;
  children: SchemaItem[];
}

/** A schema item is either a built layout node or a raw React node (your component). */
export type SchemaItem = SchemaNode | ReactNode;

export interface SchemaBuilder {
  build(): SchemaNode;
}

export function isSchemaNode(item: unknown): item is SchemaNode {
  return (
    typeof item === "object" &&
    item !== null &&
    (item as { __tablefy?: unknown }).__tablefy === "node"
  );
}

/** Build a child: layout builders → nodes; everything else stays a React node. */
export function buildItem(item: unknown): SchemaItem {
  if (
    item != null &&
    typeof (item as SchemaBuilder).build === "function"
  ) {
    return (item as SchemaBuilder).build();
  }
  return item as ReactNode;
}
