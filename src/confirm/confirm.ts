import { ConfirmOptions, ConfirmHandler } from "./types";

let confirmHandler: ConfirmHandler | null = null;

export function registerConfirm(handler: ConfirmHandler | null): void {
  confirmHandler = handler;
}

export function confirm(options: ConfirmOptions): Promise<boolean> {
  if (!confirmHandler) {
    throw new Error(
      "ConfirmProvider is not mounted. Please wrap your app with <ConfirmProvider>.",
    );
  }
  return confirmHandler(options);
}
