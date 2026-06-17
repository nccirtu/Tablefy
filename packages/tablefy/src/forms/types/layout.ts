import { ReactNode } from "react";

export interface SectionConfig<TData extends Record<string, any>> {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  columns?: number;
  collapsible?: boolean;
  collapsed?: boolean;
  icon?: ReactNode;
  hidden?: (data: TData) => boolean;
}

export interface TabConfig<TData extends Record<string, any>> {
  id: string;
  label: string;
  icon?: ReactNode;
  fields?: string[];
  sections?: SectionConfig<TData>[];
  badge?: string | number | ((data: TData) => string | number);
  disabled?: (data: TData) => boolean;
}

export interface WizardStepConfig<TData extends Record<string, any>> {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  fields?: string[];
  sections?: SectionConfig<TData>[];
  canProceed?: (data: TData) => boolean;
  beforeNext?: (data: TData) => Promise<boolean> | boolean;
}
