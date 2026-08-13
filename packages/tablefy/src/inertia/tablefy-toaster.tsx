"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { Toaster as SonnerToaster, toast, type ToasterProps } from "sonner";

type ToastType = "success" | "info" | "warning" | "error";

export interface TablefyToasterProps {
  position?: ToasterProps["position"];
  richColors?: boolean;
  closeButton?: boolean;
}

/**
 * Drop-in toaster: mounts Sonner AND listens for the `toast` flash that
 * `Notification::send()` emits (Inertia `flash` event), so the consumer needs no
 * own flash→toast wiring. Mount once in the app root.
 *
 *   import { TablefyToaster } from "@nccirtu/tablefy-v2/inertia";
 *   <TablefyToaster />
 */
export function TablefyToaster({
  position = "top-right",
  richColors = true,
  closeButton = true,
}: TablefyToasterProps = {}): ReactNode {
  // Follow the app's `.dark` class on <html>.
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );
  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    const sync = () =>
      setTheme(el.classList.contains("dark") ? "dark" : "light");
    const obs = new MutationObserver(sync);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Show toasts flashed by the backend (Notification::send → Inertia::flash).
  useEffect(
    () =>
      router.on("flash", (event) => {
        const data = (event as CustomEvent).detail?.flash?.toast as
          | { type?: ToastType; message?: string; body?: string }
          | undefined;
        if (!data?.message) return;
        const fn = (toast as Record<string, any>)[data.type ?? "info"] ?? toast;
        fn(data.message, data.body ? { description: data.body } : undefined);
      }),
    [],
  );

  return (
    <SonnerToaster
      theme={theme}
      richColors={richColors}
      closeButton={closeButton}
      position={position}
    />
  );
}

// Re-exported so consumers can fire toasts client-side too.
export { toast };
