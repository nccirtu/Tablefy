import { ReactNode } from "react";
import { FieldDefinition } from "./field";

export interface FormSection<TData = any> {
  title?: string;
  description?: string;
  fields: (keyof TData & string)[];
  collapsible?: boolean;
  collapsed?: boolean;
  columns?: number;
}

export interface FormTab<TData = any> {
  label: string;
  icon?: ReactNode;
  fields: (keyof TData & string)[];
}

export interface FormAction {
  type: "submit" | "cancel" | "custom";
  label: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
}

export type ActionsPosition = "start" | "end" | "between" | "center";

export interface FormConfig<TData = any> {
  title?: string | ((data: TData) => string);
  description?: string | ((data: TData) => string);
  fields: Map<keyof TData & string, FieldDefinition<TData, any>>;
  sections?: FormSection<TData>[];
  tabs?: FormTab<TData>[];
  actions?: FormAction[];
  actionsPosition?: ActionsPosition;
  columns?: number;
  bordered?: boolean;
  spacing?: "compact" | "normal" | "relaxed";
}
