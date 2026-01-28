export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  icon?: React.ReactNode;
  image?: string;
}

export type ConfirmHandler = (options: ConfirmOptions) => Promise<boolean>;
