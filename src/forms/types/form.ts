import { ReactNode } from "react";
import { BaseFieldConfig } from "./field";
import { SectionConfig, TabConfig, WizardStepConfig } from "./layout";
import { FormActionConfig } from "./actions";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "multi-select"
  | "checkbox"
  | "checkbox-group"
  | "toggle"
  | "radio-group"
  | "date-picker"
  | "date-time-picker"
  | "file-upload"
  | "repeater"
  | "hidden";

export interface FieldRenderProps<
  TData extends Record<string, any> = Record<string, any>,
> {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  data: TData;
}

export interface BuiltField<
  TData extends Record<string, any> = Record<string, any>,
> {
  name: string;
  type: FieldType;
  config: BaseFieldConfig<TData> & Record<string, any>;
  render: (props: FieldRenderProps<TData>) => ReactNode;
}

export interface FormSchemaConfig<TData extends Record<string, any>> {
  title?: string | ((data: TData) => string);
  description?: string | ((data: TData) => string);
  columns?: number;
  bordered?: boolean;
  spacing?: "compact" | "normal" | "relaxed";
  fields: BuiltField<TData>[];
  sections?: SectionConfig<TData>[];
  tabs?: TabConfig<TData>[];
  wizardSteps?: WizardStepConfig<TData>[];
  actions?: FormActionConfig<TData>[];
  actionsPosition?: "start" | "end" | "between" | "center";
  disabled?: boolean | ((data: TData) => boolean);
}

export interface FormBuildResult<TData extends Record<string, any>> {
  fields: BuiltField<TData>[];
  config: FormSchemaConfig<TData>;
}
