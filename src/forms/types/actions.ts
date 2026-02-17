import { ReactNode } from "react";

export interface FormActionConfig<
  TData extends Record<string, any> = Record<string, any>,
> {
  type: "submit" | "cancel" | "custom";
  label: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  disabled?: boolean | ((data: TData, processing: boolean) => boolean);
  loading?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
}
