import { ReactNode } from "react";

/**
 * Header Action Configuration
 * Defines actions that can be displayed in the table header
 */
export interface HeaderAction<TData = unknown> {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  // For bulk actions (only visible when rows are selected)
  bulk?: boolean;
  bulkOnClick?: (selectedRows: TData[]) => void;
  // Conditional rendering
  hidden?: boolean;
  // Dropdown for multiple actions
  children?: Omit<HeaderAction<TData>, "children" | "bulk">[];
}

