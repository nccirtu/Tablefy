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

const registry = new Map<string, TablefyHookRender[]>();

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
