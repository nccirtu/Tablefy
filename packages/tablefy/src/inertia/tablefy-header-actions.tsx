"use client";
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RenderHook } from "../components/render-hook";
import {
  TablefyNotifications,
  type PollInterval,
} from "./tablefy-notifications";

export interface TablefyHeaderActionsProps {
  /** Hide the built-in notifications bell. */
  notifications?: boolean;
  /** Poll the bell, e.g. 30 / "30s" / "1m" (off by default). */
  poll?: PollInterval;
  /** Your own header widgets (rendered before the bell). */
  children?: ReactNode;
  className?: string;
}

/**
 * Native, layout-agnostic header area. Drop it once into any header — it renders
 * the notifications bell plus the `header.actions` render-hook slot, so the
 * package (and your app) can inject more widgets centrally without touching this
 * file again:
 *
 *   registerTablefyRenderHook("header.actions", () => <ThemeToggle />);
 */
export function TablefyHeaderActions({
  notifications = true,
  poll,
  children,
  className,
}: TablefyHeaderActionsProps): ReactNode {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
      <RenderHook name="header.actions" />
      {notifications && <TablefyNotifications poll={poll} />}
    </div>
  );
}
