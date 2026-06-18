"use client";
import React, { ReactNode, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface TablefySearchProps {
  placeholder?: string;
  /** Target URL (defaults to the current path). */
  url?: string;
  /** Query param name (default "search"). */
  paramName?: string;
  /** Partial-reload only these props. */
  only?: string[];
  debounce?: number;
  className?: string;
}

/**
 * Global search box for the page header. Writes `?search=` into the URL
 * (debounced, preserving other query params) so the backend's
 * `->tablefy($request)` filters every view reading from the page (table,
 * kanban, …). Initial value is read back from the URL.
 */
export function TablefySearch({
  placeholder = "Suchen...",
  url,
  paramName = "search",
  only,
  debounce = 300,
  className,
}: TablefySearchProps): ReactNode {
  const page = usePage();
  const [path, query] = page.url.split("?");
  const initial = new URLSearchParams(query ?? "").get(paramName) ?? "";
  const [value, setValue] = useState(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const submit = (v: string) => {
    // Preserve existing query params (sort/filter/per_page); reset to page 1.
    const params = new URLSearchParams(query ?? "");
    if (v) params.set(paramName, v);
    else params.delete(paramName);
    params.set("page", "1");
    router.get(
      `${url ?? path}?${params.toString()}`,
      {},
      { preserveState: true, preserveScroll: true, replace: true, only },
    );
  };

  const onChange = (v: string) => {
    setValue(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => submit(v), debounce);
  };

  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            clearTimeout(timer.current);
            submit("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
