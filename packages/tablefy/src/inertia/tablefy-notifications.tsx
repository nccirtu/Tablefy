"use client";
import React, { ReactNode, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  read: boolean;
  time?: string | null;
  title: string;
  body?: string | null;
  type?: string;
  icon?: string | null;
}

interface NotificationsProp {
  items: NotificationItem[];
  unread: number;
  /** Resolved base path of the bell endpoints, sent by the PHP package. Null
   *  when the current request cannot build them (e.g. a tenant-prefixed route
   *  visited from a page without tenant context). */
  baseUrl?: string | null;
}

const DOT: Record<string, string> = {
  success: "bg-green-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  error: "bg-red-500",
};

/** Poll interval, given as seconds (number) or a string like "30s" / "1m" / "500ms". */
export type PollInterval = number | string;

/** Parse a poll value to milliseconds (0 = off). Bare numbers are seconds. */
function pollToMs(value?: PollInterval): number {
  if (value == null) return 0;
  if (typeof value === "number") return value > 0 ? value * 1000 : 0;
  const m = value.trim().match(/^(\d+)\s*(ms|s|m)?$/i);
  if (!m) return 0;
  const n = Number(m[1]);
  const unit = (m[2] ?? "s").toLowerCase();
  return unit === "ms" ? n : unit === "m" ? n * 60000 : n * 1000;
}

// Module-level default (set once via setTablefyNotificationDefaults).
let defaultPoll: PollInterval | undefined;

/** Globally enable polling for all bells (opt-in). Per-instance `poll` overrides. */
export function setTablefyNotificationDefaults(options: {
  poll?: PollInterval;
}): void {
  defaultPoll = options.poll;
}

export interface TablefyNotificationsProps {
  /**
   * Base path for the notification endpoints. Leave unset: the PHP package
   * shares the resolved path (`tablefy.notifications.baseUrl`), which already
   * carries any route prefix — a hardcoded path breaks under a tenant prefix.
   */
  baseUrl?: string;
  /** Shared-prop key (default "tablefy"). */
  propKey?: string;
  /** Poll for new notifications, e.g. 30 / "30s" / "1m". Off by default. */
  poll?: PollInterval;
  className?: string;
}

/**
 * Header notification bell. Reads `tablefy.notifications` (shared prop), shows an
 * unread badge and a list, and marks/clears via the bell endpoints. Mount next to
 * the user profile in the app header.
 */
export function TablefyNotifications({
  baseUrl,
  propKey = "tablefy",
  poll,
  className,
}: TablefyNotificationsProps): ReactNode {
  // Opt-in polling: refresh the shared prop on an interval (always running).
  useEffect(() => {
    const ms = pollToMs(poll ?? defaultPoll);
    if (!ms) return;
    const id = setInterval(() => router.reload({ only: [propKey] }), ms);
    return () => clearInterval(id);
  }, [poll, propKey]);

  const page = usePage();
  const data = (page.props as Record<string, any>)?.[propKey]
    ?.notifications as NotificationsProp | undefined;
  const items = data?.items ?? [];
  const unread = data?.unread ?? 0;
  const endpoints = baseUrl ?? data?.baseUrl ?? null;

  const opts = { preserveScroll: true, preserveState: true } as const;
  const markRead = (id: string) =>
    endpoints && router.post(`${endpoints}/${id}/read`, {}, opts);
  const markAll = () => endpoints && router.post(`${endpoints}/read-all`, {}, opts);
  const remove = (id: string) => endpoints && router.delete(`${endpoints}/${id}`, opts);

  // No reachable endpoints (e.g. the bell endpoints live behind a tenant
  // prefix and this page has no tenant context) → no bell.
  if (!endpoints) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative h-9 w-9", className)}
          aria-label="Benachrichtigungen"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Benachrichtigungen</span>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAll}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="size-3.5" /> Alle gelesen
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            Keine Benachrichtigungen
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {items.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "group flex gap-2 border-b px-3 py-2.5 last:border-b-0",
                  !n.read && "bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    DOT[n.type ?? "info"] ?? "bg-muted-foreground/40",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  {n.body && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {n.body}
                    </p>
                  )}
                  {n.time && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                      {n.time}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      title="Als gelesen markieren"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Check className="size-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(n.id)}
                    title="Entfernen"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
