import { Row } from "@tanstack/react-table";
import { ReactNode } from "react";

// Basis-Konfiguration für alle Spalten
export interface BaseColumnConfig<TData> {
  accessor: keyof TData | string;
  label?: string;
  sortable?: boolean;
  searchable?: boolean;
  hidden?: boolean;
  visibleByDefault?: boolean;
  visibilityLabel?: string;
  align?: "left" | "center" | "right";
  width?: string | number;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

// Für formatierte Werte
export interface FormattedColumnConfig<TData> extends BaseColumnConfig<TData> {
  formatter?: (value: unknown, row: Row<TData>) => ReactNode;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}

// Badge-Konfiguration
export interface BadgeColumnConfig<TData> extends BaseColumnConfig<TData> {
  variants?: Record<
    string,
    {
      label?: string;
      variant?:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "success"
        | "warning"
        | "info"
        | "muted";
      className?: string;
      icon?: ReactNode;
    }
  >;
  variantFn?: (
    value: unknown,
    row: TData,
  ) => {
    label?: string;
    variant?:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | "success"
      | "warning"
      | "info"
      | "muted";
    className?: string;
    icon?: ReactNode;
  };
  classNameFn?: (value: unknown, row: TData) => string;
}

// Action-Konfiguration
export interface ActionConfig<TData> {
  label: string;
  icon?: ReactNode;
  onClick?: (row: TData) => void;
  href?: (row: TData) => string;
  variant?: "default" | "destructive" | "ghost";
  hidden?: (row: TData) => boolean;
  disabled?: (row: TData) => boolean;
}
