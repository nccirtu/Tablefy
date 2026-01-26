import { ReactNode } from "react";
import {
  BaseFieldConfig,
  FieldDefinition,
  FieldRenderProps,
  FieldType,
} from "../types/field";

export abstract class BaseField<TData = any, TValue = any> {
  protected config: BaseFieldConfig<TData, TValue>;
  protected fieldType: FieldType;

  constructor(name: keyof TData & string, type: FieldType) {
    this.config = { name };
    this.fieldType = type;
  }

  label(label: string): this {
    this.config.label = label;
    return this;
  }

  placeholder(placeholder: string): this {
    this.config.placeholder = placeholder;
    return this;
  }

  helperText(text: string | ((data: TData) => string)): this {
    this.config.helperText = text;
    return this;
  }

  required(required: boolean = true): this {
    this.config.required = required;
    return this;
  }

  disabled(disabled: boolean | ((data: TData) => boolean) = true): this {
    this.config.disabled = disabled;
    return this;
  }

  readonly(readonly: boolean | ((data: TData) => boolean) = true): this {
    this.config.readonly = readonly;
    return this;
  }

  hidden(hidden: boolean | ((data: TData) => boolean) = true): this {
    this.config.hidden = hidden;
    return this;
  }

  default(value: TValue): this {
    this.config.defaultValue = value;
    return this;
  }

  columnSpan(span: number): this {
    this.config.columnSpan = span;
    return this;
  }

  rules(rules: string[]): this {
    this.config.rules = rules;
    return this;
  }

  dependsOn(
    field: keyof TData & string,
    condition: (value: any) => boolean,
  ): this {
    this.config.dependsOn = { field, condition };
    return this;
  }

  protected abstract render(props: FieldRenderProps<TData, TValue>): ReactNode;

  build(): FieldDefinition<TData, TValue> {
    return {
      type: this.fieldType,
      config: this.config,
      render: this.render.bind(this),
    };
  }
}
