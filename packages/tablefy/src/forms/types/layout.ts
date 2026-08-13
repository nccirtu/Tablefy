import { ReactNode } from "react";

/** One explicit row inside a section (FormRow). */
export interface FormRowConfig {
  /** Field names laid out side-by-side in this row. */
  fields: string[];
  /** Grid columns for the row (defaults to the field count). */
  columns?: number;
}

/**
 * An ordered item inside a section / tab / step / form body: a field
 * (by name), an explicit row, or an arbitrary React node (Alert, image, …).
 */
export type FormItemConfig =
  | { kind: "field"; name: string }
  | { kind: "row"; fields: string[]; columns?: number }
  | { kind: "node"; node: ReactNode };

/** A top-level form-body item — items above, plus whole Sections. */
export type FormBodyItemConfig<TData extends Record<string, any>> =
  | FormItemConfig
  | { kind: "section"; section: SectionConfig<TData> };

export interface SectionConfig<TData extends Record<string, any>> {
  id: string;
  title: string;
  description?: string;
  /** All field names in the section (for submit coverage / introspection). */
  fields: string[];
  /** Ordered render list: fields, explicit rows, and arbitrary nodes. */
  items: FormItemConfig[];
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
  /** Ordered render list (fields, rows, nodes, sections). */
  items: FormBodyItemConfig<TData>[];
  badge?: string | number | ((data: TData) => string | number);
  disabled?: (data: TData) => boolean;
}

export interface WizardStepConfig<TData extends Record<string, any>> {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  /** Ordered render list (fields, rows, nodes, sections). */
  items: FormBodyItemConfig<TData>[];
  canProceed?: (data: TData) => boolean;
  beforeNext?: (data: TData) => Promise<boolean> | boolean;
}
