import { ReactNode } from "react";
import type { FormSchemaInput } from "../dialog/types";

/**
 * Header Action Configuration
 * Defines actions that can be displayed in the table header
 */
/** A form dialog opened straight from a header action. */
export interface HeaderFormConfig {
  title?: string;
  description?: string;
  schema: FormSchemaInput<any>;
  method?: "post" | "put" | "patch";
  url: string;
  data?: Record<string, unknown>;
  submitLabel?: string;
  onSuccess?: () => void;
}

export interface HeaderAction<TData = unknown> {
  id?: string;
  label?: string;
  /** Icon name (`"plus"`) or node — the same as row and page actions take. */
  icon?: ReactNode | string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  bulk?: boolean;
  bulkOnClick?: (selectedRows: TData[]) => void;
  hidden?: boolean;
  /** Push this action into the overflow menu instead of showing it as a button. */
  overflow?: boolean;
  /** Open a form dialog, as row and page actions do. */
  form?: HeaderFormConfig;
  render?: () => ReactNode;
  children?: Omit<HeaderAction<TData>, "children" | "bulk">[];
}
