import { ReactNode } from "react";

/**
 * Header Action Configuration
 * Defines actions that can be displayed in the table header
 */
export interface HeaderAction<TData = unknown> {
  id?: string;
  label?: string;
  icon?: ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  bulk?: boolean;
  bulkOnClick?: (selectedRows: TData[]) => void;
  hidden?: boolean;
  render?: () => ReactNode;
  children?: Omit<HeaderAction<TData>, "children" | "bulk">[];
}
