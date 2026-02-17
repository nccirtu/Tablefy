import { ReactNode } from "react";
import {
  BaseFieldConfig,
  ValidationRule,
  DependencyConfig,
} from "../types/field";
import { FieldType, FieldRenderProps, BuiltField } from "../types/form";

export abstract class BaseField<
  TData extends Record<string, any>,
  TConfig extends BaseFieldConfig<TData>,
> {
  protected config: TConfig;

  constructor(name: string) {
    this.config = {
      name,
      required: false,
      disabled: false,
      readOnly: false,
      hidden: false,
      columnSpan: 1,
      rules: [],
      dependsOn: [],
    } as unknown as TConfig;
  }

  // --- Fluent API ---

  label(label: string): this {
    this.config.label = label;
    return this;
  }

  placeholder(placeholder: string): this {
    this.config.placeholder = placeholder;
    return this;
  }

  helperText(text: string): this {
    this.config.helperText = text;
    return this;
  }

  required(required = true): this {
    this.config.required = required;
    if (
      required &&
      !this.config.rules?.some((r: ValidationRule) => r.type === "required")
    ) {
      this.config.rules = [
        ...(this.config.rules || []),
        {
          type: "required",
          message: `${this.config.label || this.config.name} is required`,
        },
      ];
    }
    return this;
  }

  disabled(disabled: boolean | ((data: TData) => boolean) = true): this {
    this.config.disabled = disabled;
    return this;
  }

  readOnly(readOnly = true): this {
    this.config.readOnly = readOnly;
    return this;
  }

  hidden(hidden: boolean | ((data: TData) => boolean) = true): this {
    this.config.hidden = hidden;
    return this;
  }

  default(value: any): this {
    this.config.defaultValue = value;
    return this;
  }

  columnSpan(span: number): this {
    this.config.columnSpan = span;
    return this;
  }

  className(className: string): this {
    this.config.className = className;
    return this;
  }

  rules(rules: ValidationRule[]): this {
    this.config.rules = [...(this.config.rules || []), ...rules];
    return this;
  }

  zodSchema(schema: any): this {
    this.config.zodSchema = schema;
    return this;
  }

  dependsOn<K extends string & keyof TData>(
    field: K,
    condition: (value: TData[K], data: TData) => boolean,
    effect: "show" | "hide" | "enable" | "disable" | "setValue" = "show",
    effectValue?: any,
  ): this {
    this.config.dependsOn = [
      ...(this.config.dependsOn || []),
      { field, condition, effect, effectValue } as DependencyConfig<TData>,
    ];
    return this;
  }

  reactive(reactive = true): this {
    this.config.reactive = reactive;
    return this;
  }

  // --- Abstract ---

  abstract readonly fieldType: FieldType;

  abstract renderField(props: FieldRenderProps<TData>): ReactNode;

  // --- Build ---

  build(): BuiltField<TData> {
    return {
      name: this.config.name,
      type: this.fieldType,
      config: { ...this.config },
      render: (props: FieldRenderProps<TData>) => this.renderField(props),
    };
  }
}
