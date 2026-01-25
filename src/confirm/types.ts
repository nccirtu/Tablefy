export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
}

export type ConfirmHandler = (options: ConfirmOptions) => Promise<boolean>;
