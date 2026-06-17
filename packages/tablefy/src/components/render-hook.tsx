import { Fragment, type ReactNode } from "react";
import {
  getTablefyRenderHooks,
  type TablefyHookContext,
  type TablefyHookName,
} from "../render-hooks";

export interface RenderHookProps {
  /** The slot name to render. */
  name: TablefyHookName;
  /** Context handed to each registered callback. */
  context?: TablefyHookContext;
  /** Per-instance content rendered alongside globally registered hooks. */
  scope?: ReactNode;
}

/**
 * Renders everything registered at a named slot (plus optional per-instance
 * `scope` content). Place it where you want an injection point — the package
 * uses it internally for its own chrome, and you can use it in your own markup
 * (e.g. the sidebar) to expose slots.
 */
export function RenderHook({ name, context, scope }: RenderHookProps): ReactNode {
  const hooks = getTablefyRenderHooks(name);
  if (hooks.length === 0 && scope == null) return null;

  return (
    <>
      {scope}
      {hooks.map((render, index) => (
        <Fragment key={index}>{render(context ?? {})}</Fragment>
      ))}
    </>
  );
}
