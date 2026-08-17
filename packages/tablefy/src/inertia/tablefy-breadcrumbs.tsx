"use client";

import { Fragment, useLayoutEffect, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PageBreadcrumb } from "../schema/page-schema";
import { publishBreadcrumbs, useBreadcrumbTrail } from "./breadcrumb-store";

/**
 * Before paint on the client, plain effect on the server — the header sits
 * above the page in the tree, so publishing has to land before the browser
 * shows the old trail.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Publishes a trail for as long as the calling component is mounted. */
export function usePublishedBreadcrumbs(trail?: PageBreadcrumb[]): void {
  const key = JSON.stringify(trail ?? []);

  useIsomorphicLayoutEffect(() => {
    publishBreadcrumbs(trail);

    return () => publishBreadcrumbs();
    // The trail is rebuilt on every render, so its identity says nothing —
    // its content does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export interface TablefyBreadcrumbsProps {
  /**
   * Shown when no page has published a trail — for screens that are not a
   * PageSchema yet and still pass breadcrumbs down through the layout.
   */
  items?: PageBreadcrumb[];
  className?: string;
}

/**
 * The trail of the page currently on screen. Belongs in your header, next to
 * the sidebar trigger; drop it once and every PageSchema fills it:
 *
 *     <SidebarTrigger />
 *     <TablefyBreadcrumbs />
 *
 * The page defines the trail — `PageSchema.breadcrumbs([...])` — and this is
 * where it comes out.
 */
export function TablefyBreadcrumbs({ items, className }: TablefyBreadcrumbsProps) {
  const published = useBreadcrumbTrail();
  const trail = published.length > 0 ? published : (items ?? []);

  if (trail.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1.5 text-sm text-muted-foreground",
        className,
      )}
    >
      {trail.map((crumb, index) => {
        // The last one is where you are: no link, and in the foreground so the
        // trail reads as "there, there, *here*".
        const isCurrent = index === trail.length - 1;

        return (
          <Fragment key={index}>
            {index > 0 && (
              <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
            )}
            {crumb.href && !isCurrent ? (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            ) : (
              <span
                aria-current={isCurrent ? "page" : undefined}
                className={isCurrent ? "text-foreground" : undefined}
              >
                {crumb.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
