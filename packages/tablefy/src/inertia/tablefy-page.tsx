"use client";

import { type ReactNode, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveLucideIcon } from "../lib/icons";
import type { PageAction, PageBuildResult } from "../schema/page-schema";
import { RenderHook } from "../components/render-hook";
import { SchemaRenderer } from "../tablefy/schema-content";
import { TablefySearch } from "./tablefy-search";
import { dialog } from "../dialog/dialog";
import { setPageProps } from "../dialog/store";
import {
  TablefyBreadcrumbs,
  usePublishedBreadcrumbs,
} from "./tablefy-breadcrumbs";

function ActionButton({ action }: { action: PageAction }) {
  const Icon = typeof action.icon === "string" ? resolveLucideIcon(action.icon) : null;
  const content = (
    <>
      {Icon ? <Icon /> : (action.icon as ReactNode)}
      {action.label}
    </>
  );
  const variant = action.variant ?? "default";

  // Form dialog (e.g. "Neu" → create modal).
  if (action.form) {
    const f = action.form;
    return (
      <Button variant={variant} onClick={() => dialog.form({ ...f })}>
        {content}
      </Button>
    );
  }

  // Confirm before navigating/running.
  if (action.confirm) {
    const opts = action.confirm === true ? {} : action.confirm;
    const exec = () => {
      if (action.href) router.visit(action.href);
      else action.onClick?.();
    };
    return (
      <Button
        variant={variant}
        onClick={() =>
          void dialog.confirm(opts).then((ok) => {
            if (ok) exec();
          })
        }
      >
        {content}
      </Button>
    );
  }

  if (action.href) {
    return (
      <Button asChild variant={variant}>
        <Link href={action.href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button variant={variant} onClick={action.onClick}>
      {content}
    </Button>
  );
}

export interface TablefyPageProps {
  schema: PageBuildResult;
  /**
   * Render the breadcrumbs at the top of the page instead of publishing them
   * to <TablefyBreadcrumbs> in your header. For layouts that have no header to
   * put them in.
   */
  inlineBreadcrumbs?: boolean;
  className?: string;
}

/**
 * Renders a PageSchema: header (title/description/actions) + the recursive
 * content body. Lives inside your app layout; uses bundled components.
 *
 * Breadcrumbs are defined here — `PageSchema.breadcrumbs([...])` — but come out
 * wherever <TablefyBreadcrumbs> is mounted, normally in the app header next to
 * the sidebar trigger. Pass `inlineBreadcrumbs` to keep them on the page.
 */
export function TablefyPage({
  schema,
  inlineBreadcrumbs = false,
  className,
}: TablefyPageProps) {
  const { title, description, breadcrumbs, actions, search, content } =
    schema.config;
  const hasHeader = !!(
    title ||
    description ||
    search ||
    (actions && actions.length > 0)
  );

  // Sync page props into the dialog store so modal forms (rendered by the host
  // outside the Inertia tree) can resolve relationship-select options.
  const page = usePage();
  useEffect(() => {
    setPageProps(page.props as Record<string, unknown>);
  }, [page.props]);

  usePublishedBreadcrumbs(inlineBreadcrumbs ? undefined : breadcrumbs);

  return (
    <div className={cn("flex flex-1 flex-col gap-6 p-4", className)}>
      {inlineBreadcrumbs && <TablefyBreadcrumbs items={breadcrumbs} />}

      {hasHeader && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <RenderHook name="page.header.start" />
              {title && (
                <h1 className="text-2xl font-semibold tracking-tight">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
            {/* Global search next to the title (drives the URL ?search=). */}
            {search && (
              <TablefySearch
                placeholder={search.placeholder}
                url={search.url}
                paramName={search.paramName}
                only={search.only}
                debounce={search.debounce}
                className="w-64"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <RenderHook name="page.actions.start" />
            {actions?.map((action, index) => (
              <ActionButton key={index} action={action} />
            ))}
            <RenderHook name="page.actions.end" />
          </div>
        </div>
      )}

      <RenderHook name="page.header.end" />

      <div className="flex flex-col gap-6">
        <SchemaRenderer items={content} />
      </div>

      <RenderHook name="page.footer" />
    </div>
  );
}
