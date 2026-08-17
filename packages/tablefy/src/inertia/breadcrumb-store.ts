import { useSyncExternalStore } from "react";
import type { PageBreadcrumb } from "../schema/page-schema";

type Listener = () => void;

interface BreadcrumbStore {
  trail: PageBreadcrumb[];
  listeners: Set<Listener>;
}

// Same reasoning as the dialog store: the page publishes from inside the
// Inertia tree, the header reads from above it, and the two may be reading
// different inlined copies of this module. One object on globalThis, one trail.
const GLOBAL_KEY = "__TABLEFY_BREADCRUMB_STORE__";
const root = globalThis as unknown as Record<string, BreadcrumbStore | undefined>;
const store: BreadcrumbStore =
  root[GLOBAL_KEY] ??
  (root[GLOBAL_KEY] = { trail: [], listeners: new Set<Listener>() });

const EMPTY: PageBreadcrumb[] = [];

function sameTrail(a: PageBreadcrumb[], b: PageBreadcrumb[]): boolean {
  return (
    a.length === b.length &&
    a.every((crumb, i) => crumb.label === b[i].label && crumb.href === b[i].href)
  );
}

/**
 * Hand the current page's trail to whoever renders it. Called by <TablefyPage>;
 * pass an empty array (or nothing) on unmount so a page without breadcrumbs
 * does not inherit the last one's.
 */
export function publishBreadcrumbs(trail?: PageBreadcrumb[]): void {
  const next = trail ?? EMPTY;

  if (sameTrail(store.trail, next)) {
    return;
  }

  store.trail = next;
  store.listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener): () => void {
  store.listeners.add(listener);
  return () => store.listeners.delete(listener);
}

function snapshot(): PageBreadcrumb[] {
  return store.trail;
}

/** The trail the current page published, for anything rendering it. */
export function useBreadcrumbTrail(): PageBreadcrumb[] {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
