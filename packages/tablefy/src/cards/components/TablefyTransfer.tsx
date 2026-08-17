"use client";

import React, { type ReactNode, useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CardBody } from "../../card/card-body";
import type { CardBuildResult } from "../../card/types";
import { writeForRow, type WriteRequest } from "../../lib/requests";

export interface TablefyTransferProps<T extends Record<string, any>> {
  /** How one entry looks. Meant to be a `.compact()` CardSchema — a list, not tiles. */
  schema: CardBuildResult<T>;
  /** Everything that could be assigned. Entries already assigned are filtered out. */
  available: T[];
  /** What is assigned right now. */
  assigned: T[];
  availableTitle: string;
  assignedTitle: string;
  searchPlaceholder?: string;
  /** What the search reads. Defaults to every string on the record. */
  searchText?: (record: T) => string;
  /** Shown when nothing is left to assign / nothing is assigned / nothing matches. */
  emptyAvailable?: string;
  emptyAssigned?: string;
  emptySearch?: string;
  /** Where assigning and un-assigning write to. */
  attach: WriteRequest<T>;
  detach: WriteRequest<T>;
  attachLabel?: string;
  detachLabel?: string;
  /** Sits under the search box — normally the "new entry" button. */
  headerAction?: ReactNode;
  /** Tells the two sides apart. Defaults to `id`. */
  identify?: (record: T) => unknown;
  className?: string;
}

function defaultSearchText<T extends Record<string, any>>(record: T): string {
  return Object.values(record)
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

/**
 * Two lists side by side: what can be assigned, and what is. Clicking an entry's
 * button moves it — the package performs the write, so the screen only says
 * where to:
 *
 *     <TablefyTransfer
 *       schema={serviceRow}
 *       available={allServices}
 *       assigned={category.services}
 *       attach={{ url: attachUrl, method: "post", data: (s) => ({ service_id: s.id }), only: [...] }}
 *       detach={{ url: detachUrl, method: "post", data: (s) => ({ service_id: s.id }), only: [...] }}
 *     />
 *
 * Both sides scroll on their own so the page keeps its height however long a
 * catalogue gets.
 */
export function TablefyTransfer<T extends Record<string, any>>({
  schema,
  available,
  assigned,
  availableTitle,
  assignedTitle,
  searchPlaceholder,
  searchText = defaultSearchText,
  emptyAvailable,
  emptyAssigned,
  emptySearch,
  attach,
  detach,
  attachLabel,
  detachLabel,
  headerAction,
  identify = (record) => (record as { id?: unknown }).id,
  className,
}: TablefyTransferProps<T>): ReactNode {
  const [search, setSearch] = useState("");

  const assignedIds = useMemo(
    () => new Set(assigned.map(identify)),
    [assigned, identify],
  );

  const open = useMemo(
    () => available.filter((record) => !assignedIds.has(identify(record))),
    [available, assignedIds, identify],
  );

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();

    return term ? open.filter((record) => searchText(record).includes(term)) : open;
  }, [open, search, searchText]);

  const row = (record: T, isAssigned: boolean) => (
    <CardBody
      key={String(identify(record))}
      schema={schema}
      record={record}
      imageVariant="none"
      trailing={
        <Button
          variant={isAssigned ? "destructive" : "outline"}
          size="icon"
          className="size-8 shrink-0"
          aria-label={(isAssigned ? detachLabel : attachLabel) ?? undefined}
          title={(isAssigned ? detachLabel : attachLabel) ?? undefined}
          onClick={() => writeForRow(isAssigned ? detach : attach, record)}
        >
          {isAssigned ? <X /> : <Plus />}
        </Button>
      }
    />
  );

  const empty = (text?: string) =>
    text ? <p className="text-sm text-muted-foreground">{text}</p> : null;

  return (
    <div className={cn("grid grid-cols-1 gap-4 lg:h-full lg:grid-cols-2", className)}>
      <Card className="flex h-[60vh] min-h-0 flex-col overflow-hidden lg:h-full">
        <CardHeader className="space-y-3">
          <CardTitle>{availableTitle}</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8"
            />
          </div>
          {headerAction}
        </CardHeader>
        <CardContent className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
          {matches.length === 0 &&
            empty(open.length === 0 ? emptyAvailable : emptySearch)}
          {matches.map((record) => row(record, false))}
        </CardContent>
      </Card>

      <Card className="flex h-[60vh] min-h-0 flex-col overflow-hidden lg:h-full">
        <CardHeader>
          <CardTitle>{assignedTitle}</CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
          {assigned.length === 0 && empty(emptyAssigned)}
          {assigned.map((record) => row(record, true))}
        </CardContent>
      </Card>
    </div>
  );
}
