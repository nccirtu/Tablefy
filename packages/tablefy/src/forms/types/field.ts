import { ReactNode } from "react";

/** Which form operation is active (used by visibleOn/hiddenOn/disabledOn). */
export type FormOperation = "create" | "edit";

/** Update other fields from afterStateUpdated. */
export type FieldStateSetter = (field: string, value: any) => void;

// Base configuration shared by all form fields
export interface BaseFieldConfig<TData extends Record<string, any>> {
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean | ((data: TData) => boolean);
  disabled?: boolean | ((data: TData) => boolean);
  readOnly?: boolean | ((data: TData) => boolean);
  hidden?: boolean | ((data: TData) => boolean);
  defaultValue?: any;
  columnSpan?: number;
  columnSpanFull?: boolean;
  className?: string;

  // Context (create vs edit)
  visibleOn?: FormOperation[];
  hiddenOn?: FormOperation[];
  disabledOn?: FormOperation[];

  // Validation
  rules?: ValidationRule[];
  zodSchema?: any;
  validate?: (value: any, data: TData) => string | null | undefined;

  // Reactivity
  dependsOn?: DependencyConfig<TData>[];
  reactive?: boolean;
  debounce?: number;
  afterStateUpdated?: (
    value: any,
    set: FieldStateSetter,
    data: TData,
  ) => void;

  // Guidance / UX
  hint?: string;
  hintIcon?: ReactNode;
  hintColor?: string;
  tooltip?: string;
  autofocus?: boolean;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;

  // Value / submit
  dehydrated?: boolean; // default true; false → not sent to the server
  formatStateUsing?: (value: any, data: TData) => any;
  mutateBeforeSave?: (value: any, data: TData) => any;
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
  /**
   * A foreign key is a number, an enum a string — the field takes both and
   * compares as string, which is what the rendered DOM works in anyway.
   */
  value: string | number;
  disabled?: boolean;
  group?: string;
  description?: string;
  icon?: ReactNode;
}

export interface SelectConfig<TData extends Record<string, any>>
  extends BaseFieldConfig<TData> {
  options: SelectOption[] | ((data: TData) => SelectOption[]);
  /** Resolve options from a page prop by name (relationship select). */
  optionsFrom?: string;
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
