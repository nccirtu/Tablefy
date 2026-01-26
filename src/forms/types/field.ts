import { ReactNode } from "react";

export type FieldValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | string[]
  | number[];

export interface BaseFieldConfig<TData = any, TValue = any> {
  name: keyof TData & string;
  label?: string;
  placeholder?: string;
  helperText?: string | ((data: TData) => string);
  required?: boolean;
  disabled?: boolean | ((data: TData) => boolean);
  readonly?: boolean | ((data: TData) => boolean);
  hidden?: boolean | ((data: TData) => boolean);
  defaultValue?: TValue;
  columnSpan?: number;
  rules?: string[];
  dependsOn?: {
    field: keyof TData & string;
    condition: (value: any) => boolean;
  };
}

export interface FieldRenderProps<TData = any, TValue = any> {
  field: BaseFieldConfig<TData, TValue>;
  value: TValue;
  error?: string;
  onChange: (value: TValue) => void;
  onBlur?: () => void;
  data: TData;
}

export type FieldType =
  | "text"
  | "textarea"
  | "password"
  | "email"
  | "url"
  | "number"
  | "select"
  | "multiselect"
  | "checkbox"
  | "checkbox-group"
  | "radio"
  | "toggle"
  | "date"
  | "date-range"
  | "time"
  | "datetime"
  | "file"
  | "multi-file"
  | "image"
  | "color"
  | "slider"
  | "rating"
  | "hidden"
  | "rich-text"
  | "markdown"
  | "code";

export interface FieldDefinition<TData = any, TValue = any> {
  type: FieldType;
  config: BaseFieldConfig<TData, TValue>;
  render: (props: FieldRenderProps<TData, TValue>) => ReactNode;
}
