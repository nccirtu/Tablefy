import { KanbanColumn } from "./types";

/** Append an auto-column for any group value in the data without a column. */
export function withOrphanColumns<T extends Record<string, any>>(
  columns: KanbanColumn[],
  records: T[],
  groupBy: string,
): KanbanColumn[] {
  const known = new Set(columns.map((c) => c.id));
  const orphans = new Set<string>();
  for (const r of records) {
    const v = getByPath(r, groupBy);
    if (v != null && !known.has(String(v))) orphans.add(String(v));
  }
  if (orphans.size === 0) return columns;
  return [...columns, ...[...orphans].map((id) => ({ id, label: id }))];
}

/** Group records into `{ columnId: records[] }`, preserving column order. */
export function groupRecords<T extends Record<string, any>>(
  records: T[],
  columns: KanbanColumn[],
  groupBy: string,
): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  for (const c of columns) map[c.id] = [];
  for (const r of records) {
    const key = String(getByPath(r, groupBy));
    if (!map[key]) map[key] = [];
    map[key].push(r);
  }
  return map;
}

/** Find a card's column + index within a grouped mapping. */
export function locateItem<T extends Record<string, any>>(
  mapping: Record<string, T[]>,
  id: string,
  getItemValue: (record: T) => string,
): { col: string; idx: number; item: T } | null {
  for (const [col, items] of Object.entries(mapping)) {
    const idx = items.findIndex((it) => getItemValue(it) === id);
    if (idx !== -1) return { col, idx, item: items[idx] };
  }
  return null;
}

/** Resolve a value from a record by dot-path (e.g. "company.name"). */
export function getByPath(record: any, path: string): any {
  if (!path) return undefined;
  if (path.indexOf(".") === -1) return record?.[path];
  return path.split(".").reduce((acc, key) => acc?.[key], record);
}

/** Resolve a card slot that can be an accessor string or a function. */
export function resolveSlot<T>(
  record: T,
  slot: string | ((record: T) => any) | undefined,
): any {
  if (slot === undefined) return undefined;
  return typeof slot === "function"
    ? (slot as (r: T) => any)(record)
    : getByPath(record, slot as string);
}

/** Tailwind accent classes for a named color (dot + soft badge). */
export function colorDot(color?: string): string {
  if (!color) return "bg-muted-foreground/40";
  const map: Record<string, string> = {
    slate: "bg-slate-500",
    gray: "bg-gray-500",
    red: "bg-red-500",
    amber: "bg-amber-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    violet: "bg-violet-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    orange: "bg-orange-500",
  };
  return map[color] ?? "";
}
