import { router } from "@inertiajs/react";

/** What a declarative write sends. */
export type RequestPayload = Record<string, string | number | boolean | null>;

export interface WriteRequest<TData> {
  /** Where to write. */
  url: string | ((row: TData) => string);
  /** What to send. Defaults to nothing. */
  data?: RequestPayload | ((row: TData) => RequestPayload);
  method?: "patch" | "put" | "post" | "delete";
  /** Runs after the request succeeds. */
  onSuccess?: () => void;
}

/**
 * Performs a declarative write for a row.
 *
 * Columns and actions describe *where* and *what* — this is the one place that
 * actually talks to the server, so a screen never has to hand-write a
 * `router.patch(...)` just to flip a switch. The page keeps its scroll position,
 * which is what you want when the control stays on screen.
 */
export function writeForRow<TData>(
  request: WriteRequest<TData>,
  row: TData,
  extra: RequestPayload = {},
): void {
  const url =
    typeof request.url === "function" ? request.url(row) : request.url;

  const data =
    typeof request.data === "function" ? request.data(row) : (request.data ?? {});

  const method = request.method ?? "patch";

  router[method](
    url,
    { ...data, ...extra },
    { preserveScroll: true, onSuccess: request.onSuccess },
  );
}
