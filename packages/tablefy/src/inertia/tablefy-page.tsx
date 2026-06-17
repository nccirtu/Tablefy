"use client";

import { Fragment, type ReactNode, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveLucideIcon } from "../lib/icons";
import type { PageAction, PageBuildResult } from "../schema/page-schema";
import { RenderHook } from "../components/render-hook";
import { SchemaRenderer } from "../tablefy/schema-content";
import { dialog } from "../dialog/dialog";
import { setPageProps } from "../dialog/store";

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
  className?: string;
}

/**
 * Renders a PageSchema: breadcrumbs + header (title/description/actions) + the
 * recursive content body. Lives inside your app layout; uses bundled components.
 */
export function TablefyPage({ schema, className }: TablefyPageProps) {
  const { title, description, breadcrumbs, actions, content } = schema.config;
  const hasHeader = !!(title || description || (actions && actions.length > 0));

  // Sync page props into the dialog store so modal forms (rendered by the host
  // outside the Inertia tree) can resolve relationship-select options.
  const page = usePage();
  useEffect(() => {
    setPageProps(page.props as Record<string, unknown>);
  }, [page.props]);

  return (
    <div className={cn("flex flex-1 flex-col gap-6 p-4", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={index}>
              {index > 0 && <span className="text-muted-foreground/50">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </Fragment>
          ))}
        </nav>
      )}

      {hasHeader && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <RenderHook name="page.header.start" />
            {title && (
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            )}
            {description && <p className="text-muted-foreground">{description}</p>}
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
