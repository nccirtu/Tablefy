import type { ReactNode } from "react";
import type { ConfirmOptions } from "../confirm/types";
import type { FormBuildResult } from "../forms";

export type { ConfirmOptions };

/** A form schema: an already-built result, or a builder exposing `.build()`. */
export type FormSchemaInput =
  | FormBuildResult<Record<string, unknown>>
  | { build(): FormBuildResult<Record<string, unknown>> };

export interface FormDialogOptions {
  title?: string;
  description?: string;
  /** The form schema (`FormSchema.make()....build()` or the builder itself). */
  schema: FormSchemaInput;
  /** Where to submit (store/update route). */
  url: string;
  method?: "post" | "put" | "patch";
  /** Prefill values (e.g. the row record for an edit dialog). */
  data?: Record<string, unknown>;
  submitLabel?: string;
  cancelLabel?: string;
  /** Runs after a successful submit, before the dialog closes. */
  onSuccess?: () => void;
}

export interface CustomDialogOptions {
  title?: string;
  description?: string;
  content: ReactNode;
  className?: string;
}

export interface ConfirmDialogState {
  kind: "confirm";
  id: string;
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

export interface FormDialogState {
  kind: "form";
  id: string;
  options: FormDialogOptions;
}

export interface CustomDialogState {
  kind: "custom";
  id: string;
  options: CustomDialogOptions;
}

export type DialogState =
  | ConfirmDialogState
  | FormDialogState
  | CustomDialogState;
