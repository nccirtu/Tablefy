"use client";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import type { CardBuildResult } from "../../card/types";
import { TablefyCards } from "./TablefyCards";

export interface ServerCardsProps<T extends Record<string, any>> {
  /** Shared card-content schema (CardSchema). */
  schema: CardBuildResult<T>;
  /** Grid column count (default 3). */
  columns?: number;
  /** Page size — keep in sync with the controller's `$cardsPerPage`. */
  perPage?: number;
  /** "button" (default) or "infinite" (auto-load on scroll). */
  loadMode?: "button" | "infinite";
  /** Inertia prop name returning `{ items, hasMore }` (match the backend). */
  prop?: string;
  className?: string;
}

interface CardsPage<T> {
  items: T[];
  hasMore: boolean;
}

/**
 * Inertia card grid with "load more" / infinite scroll. Each request fetches one
 * page `{ items, hasMore }`; pages accumulate locally and reset when the global
 * search/filters change — so search results never mix with previous pages.
 */
export function ServerCards<T extends Record<string, any>>({
  schema,
  columns = 3,
  perPage = 12,
  loadMode = "button",
  prop = "cards",
  className,
}: ServerCardsProps<T>): ReactNode {
  const page = usePage();

  // Reset when search/filters change (ignore the cards_page param itself).
  const [path, queryStr] = page.url.split("?");
  const params = new URLSearchParams(queryStr ?? "");
  params.delete("cards_page");
  const baseKey = `${path}?${params.toString()}`;

  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(0);

  const fetchPage = (next: number, replace: boolean) => {
    setLoading(true);
    router.reload({
      only: [prop],
      data: { cards_page: next, cards_per_page: perPage },
      preserveScroll: true,
      preserveState: true,
      onSuccess: (visit: { props: Record<string, any> }) => {
        const data = visit.props[prop] as CardsPage<T> | undefined;
        if (!data) return;
        setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
        setHasMore(!!data.hasMore);
        pageRef.current = next;
      },
      onFinish: () => setLoading(false),
    });
  };

  // (Re)load the first page on mount and whenever search/filters change.
  useEffect(() => {
    setItems([]);
    pageRef.current = 0;
    fetchPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseKey]);

  return (
    <TablefyCards
      schema={schema}
      records={items}
      columns={columns}
      hasMore={hasMore}
      loading={loading}
      onLoadMore={() => fetchPage(pageRef.current + 1, false)}
      loadMode={loadMode}
      className={className}
    />
  );
}
