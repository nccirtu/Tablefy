import { ReactNode } from "react";

// Base configuration shared by all form fields
export interface BaseFieldConfig<TData extends Record<string, any>> {
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean | ((data: TData) => boolean);
  readOnly?: boolean;
  hidden?: boolean | ((data: TData) => boolean);
  defaultValue?: any;
  columnSpan?: number;
  className?: string;

  // Validation
  rules?: ValidationRule[];
  zodSchema?: any;

  // Reactivity
  dependsOn?: DependencyConfig<TData>[];
  reactive?: boolean;
}

export interface ValidationRule {
  type: string;
  value?: any;
  message?: string;
}

export interface DependencyConfig<TData> {
  field: string & keyof TData;
  condition: (value: any, data: TData) => boolean;
  effect: "show" | "hide" | "enable" | "disable" | "setValue";
  effectValue?: any;
}

// --- Field-specific configs ---

export interface TextInputConfig<TData extends Record<string, any>>
  extends BaseFieldConfig<TData> {
  type?: "text" | "email" | "password" | "number" | "url" | "tel";
  minLength?: number;
  maxLength?: number;
  prefix?: string | ReactNode;
  suffix?: string | ReactNode;
  mask?: string;
  autocomplete?: string;
}

export interface TextareaConfig<TData extends Record<string, any>>
  extends BaseFieldConfig<TData> {
  rows?: number;
  minLength?: number;
  maxLength?: number;
  autoResize?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  group?: string;
  description?: string;
  icon?: ReactNode;
}

export interface SelectConfig<TData extends Record<string, any>>
  extends BaseFieldConfig<TData> {
  options: SelectOption[] | ((data: TData) => SelectOption[]);
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  maxItems?: number;
  loadOptions?: (query: string) => Promise<SelectOption[]>;
}

export interface CheckboxConfig<TData extends Record<string, any>>
  extends BaseFieldConfig<TData> {
  // Single checkbox - value is boolean
}

export interface CheckboxGroupConfig<TData extends Record<string, any>>
  extends BaseFieldConfig<TData> {
  options: SelectOption[];
  columns?: number;
}

export interface ToggleConfig<TData extends Record<string, any>>
  extends BaseFieldConfig<TData> {
  onLabel?: string;
  offLabel?: string;
}

export interface RadioGroupConfig<TData extends Record<string, any>>
  extends BaseFieldConfig<TData> {
  options: SelectOption[];
  orientation?: "horizontal" | "vertical";
}

export interface DatePickerConfig<TData extends Record<string, any>>
  extends BaseFieldConfig<TData> {
  minDate?: Date | ((data: TData) => Date);
  maxDate?: Date | ((data: TData) => Date);
  format?: string;
  includeTime?: boolean;
  locale?: string;
}

export interface FileUploadConfig<TData extends Record<string, any>>
  extends BaseFieldConfig<TData> {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  maxFiles?: number;
  preview?: boolean;
}

export interface RepeaterConfig<TData extends Record<string, any>>
  extends BaseFieldConfig<TData> {
  fields: any[];
  minItems?: number;
  maxItems?: number;
  addLabel?: string;
  collapsible?: boolean;
  orderable?: boolean;
}

export interface HiddenConfig<TData extends Record<string, any>>
  extends BaseFieldConfig<TData> {
  // No extra config
}
