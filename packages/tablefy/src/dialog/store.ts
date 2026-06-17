import type { DialogState } from "./types";

type Listener = (s: DialogState[]) => void;

interface DialogStore {
  stack: DialogState[];
  listeners: Set<Listener>;
  counter: number;
  /** Latest Inertia page props, synced by <TablefyPage> (which is inside the
   *  Inertia tree). The dialog host reads these for relationship-select options
   *  without calling usePage() itself (it is mounted outside the Inertia App). */
  pageProps: Record<string, unknown>;
}

// State lives on globalThis so the imperative `dialog` API, the row actions
// (main bundle) and the page/header actions (the /inertia bundle) all share ONE
// stack at runtime — each bundle may inline its own copy of this code, but they
// read/write the same global object.
const GLOBAL_KEY = "__TABLEFY_DIALOG_STORE__";
const root = globalThis as unknown as Record<string, DialogStore | undefined>;
const store: DialogStore =
  root[GLOBAL_KEY] ??
  (root[GLOBAL_KEY] = {
    stack: [],
    listeners: new Set<Listener>(),
    counter: 0,
    pageProps: {},
  });

/** Synced from <TablefyPage> (inside Inertia) so the host can read page props. */
export function setPageProps(props: Record<string, unknown>): void {
  store.pageProps = props;
}

export function getPageProps(): Record<string, unknown> {
  return store.pageProps;
}

export function nextDialogId(): string {
  store.counter += 1;
  return `tablefy-dialog-${store.counter}`;
}

export function getDialogs(): DialogState[] {
  return store.stack;
}

export function subscribeDialogs(listener: Listener): () => void {
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

function emit(): void {
  for (const listener of store.listeners) listener(store.stack);
}

export function pushDialog(dialog: DialogState): void {
  store.stack = [...store.stack, dialog];
  emit();
}

/** Close a dialog by id, or the top-most one if no id is given. */
export function closeDialog(id?: string): void {
  store.stack = id
    ? store.stack.filter((d) => d.id !== id)
    : store.stack.slice(0, -1);
  emit();
}
