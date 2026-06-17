import { closeDialog, nextDialogId, pushDialog } from "./store";
import type {
  ConfirmOptions,
  CustomDialogOptions,
  FormDialogOptions,
} from "./types";

/**
 * Imperative dialog API — callable from anywhere (row/page actions, JSX,
 * handlers outside React). Requires `<TablefyDialogs />` mounted once in the
 * app (it renders the stack). One engine, three conveniences.
 */
export const dialog = {
  /** Confirmation dialog. Resolves to true (confirmed) / false (cancelled). */
  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      pushDialog({ kind: "confirm", id: nextDialogId(), options, resolve });
    });
  },

  /** Open a schema form in a modal; submits to `url`, closes on success. */
  form(options: FormDialogOptions): string {
    const id = nextDialogId();
    pushDialog({ kind: "form", id, options });
    return id;
  },

  /** Open arbitrary content in a modal. */
  open(options: CustomDialogOptions): string {
    const id = nextDialogId();
    pushDialog({ kind: "custom", id, options });
    return id;
  },

  /** Close a dialog by id, or the top-most one. */
  close(id?: string): void {
    closeDialog(id);
  },
};
