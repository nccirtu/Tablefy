import type { ReactNode } from "react";

/** Context passed to a render-hook callback (varies per slot). */
export interface TablefyHookContext {
  resource?: string;
  row?: unknown;
  [key: string]: unknown;
}

/** Built-in slot names. You can also register/render any custom string name. */
export type TablefyRenderHook =
  | "sidebar.header.end"
  | "sidebar.nav.start"
  | "sidebar.nav.end"
  | "sidebar.footer.start"
  | "sidebar.footer.end"
  | "page.header.start"
  | "page.header.end"
  | "page.actions.start"
  | "page.actions.end"
  | "page.footer";

// `string & {}` keeps autocomplete for the known names while allowing custom ones.
export type TablefyHookName = TablefyRenderHook | (string & {});

export type TablefyHookRender = (context: TablefyHookContext) => ReactNode;

// Shared on globalThis so registrations made in one bundle (e.g. the main
// `@nccirtu/tablefy-v2`) are visible to `<RenderHook>` rendered from another
// (e.g. `@nccirtu/tablefy-v2/inertia`).
const REGISTRY_KEY = "__tablefyRenderHooks__";
const globalRef = globalThis as unknown as Record<string, unknown>;
const registry: Map<string, TablefyHookRender[]> =
  (globalRef[REGISTRY_KEY] as Map<string, TablefyHookRender[]>) ??
  (globalRef[REGISTRY_KEY] = new Map<string, TablefyHookRender[]>());

/**
 * Register content to render at a named slot. Returns an unregister function.
 *
 *   registerTablefyRenderHook("sidebar.nav.end", () => <MyNavSection />);
 */
export function registerTablefyRenderHook(
  name: TablefyHookName,
  render: TablefyHookRender,
): () => void {
  const list = registry.get(name) ?? [];
  list.push(render);
  registry.set(name, list);

  return () => {
    const current = registry.get(name);
    if (!current) return;
    const index = current.indexOf(render);
    if (index >= 0) current.splice(index, 1);
  };
}

/** All render callbacks registered for a slot (used internally by `<RenderHook>`). */
export function getTablefyRenderHooks(name: string): TablefyHookRender[] {
  return registry.get(name) ?? [];
}
