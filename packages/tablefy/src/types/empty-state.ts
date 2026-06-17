import { ReactNode } from "react";

/**
 * Empty State Configuration
 * Defines how empty states are displayed in the table
 */
export interface EmptyStateConfig {
  icon?: ReactNode;
  imageUrl?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: ReactNode;
  };
  // Different states
  variant?: "default" | "search" | "filter" | "error" | "custom";
}

