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
  /**
   * Query parameter carrying the page. Two grids on one screen need one each,
   * or paging in the first would page the second (match the backend).
   */
  pageParameter?: string;
  perPageParameter?: string;
  loadMoreLabel?: string;
  emptyText?: string;
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
  pageParameter = "cards_page",
  perPageParameter = "cards_per_page",
  loadMoreLabel,
  emptyText,
  className,
}: ServerCardsProps<T>): ReactNode {
  const page = usePage();

  // Reset when search/filters change (ignore this grid's own page param).
  const [path, queryStr] = page.url.split("?");
  const params = new URLSearchParams(queryStr ?? "");
  params.delete(pageParameter);
  const baseKey = `${path}?${params.toString()}`;

  // Search and filters live in the URL, exactly as the table's do — the
  // backend reads the same `?search=` / `?filter[col]=` it already reads for
  // `tablefy()`, so a grid needs no second contract.
  const searchValue = params.get("search") ?? "";

  const filterValues: Record<string, string> = {};
  params.forEach((value, key) => {
    const match = key.match(/^filter\[(.+)\]$/);
    if (match) filterValues[match[1]] = value;
  });

  const navigate = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(queryStr ?? "");
    next.delete(pageParameter);
    mutate(next);

    const query = next.toString();
    router.get(query ? `${path}?${query}` : path, {}, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      only: [prop],
    });
  };

  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(0);

  const fetchPage = (next: number, replace: boolean) => {
    setLoading(true);
    router.reload({
      only: [prop],
      data: { [pageParameter]: next, [perPageParameter]: perPage },
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
      loadMoreLabel={loadMoreLabel}
      emptyText={emptyText}
      searchValue={searchValue}
      onSearchChange={(value) =>
        navigate((next) => {
          if (value) next.set("search", value);
          else next.delete("search");
        })
      }
      filterValues={filterValues}
      onFilterChange={(column, value) =>
        navigate((next) => {
          if (value === undefined || value === null || value === "") {
            next.delete(`filter[${column}]`);
          } else {
            next.set(`filter[${column}]`, String(value));
          }
        })
      }
      onResetFilters={() =>
        navigate((next) => {
          [...next.keys()]
            .filter((key) => key.startsWith("filter["))
            .forEach((key) => next.delete(key));
        })
      }
      className={className}
    />
  );
}
