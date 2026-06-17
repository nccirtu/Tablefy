import { ReactNode } from "react";
import {
  BaseFieldConfig,
  ValidationRule,
  DependencyConfig,
  FormOperation,
  FieldStateSetter,
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

  required(
    required: boolean | ((data: TData) => boolean) = true,
  ): this {
    this.config.required = required;
    if (
      required === true &&
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

  readOnly(readOnly: boolean | ((data: TData) => boolean) = true): this {
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

  /** Re-render the form on change (optionally debounced). */
  live(options?: { debounce?: number }): this {
    this.config.reactive = true;
    if (options?.debounce) this.config.debounce = options.debounce;
    return this;
  }

  debounce(ms: number): this {
    this.config.debounce = ms;
    this.config.reactive = true;
    return this;
  }

  /** Run a side effect when this field changes (e.g. derive another field). */
  afterStateUpdated(
    fn: (value: any, set: FieldStateSetter, data: TData) => void,
  ): this {
    this.config.afterStateUpdated = fn;
    this.config.reactive = true;
    return this;
  }

  // --- Context (create vs edit) ---

  visibleOn(operations: FormOperation | FormOperation[]): this {
    this.config.visibleOn = ([] as FormOperation[]).concat(operations);
    return this;
  }

  hiddenOn(operations: FormOperation | FormOperation[]): this {
    this.config.hiddenOn = ([] as FormOperation[]).concat(operations);
    return this;
  }

  disabledOn(operations: FormOperation | FormOperation[]): this {
    this.config.disabledOn = ([] as FormOperation[]).concat(operations);
    return this;
  }

  // --- Guidance / UX ---

  hint(text: string): this {
    this.config.hint = text;
    return this;
  }

  hintIcon(icon: ReactNode): this {
    this.config.hintIcon = icon;
    return this;
  }

  hintColor(color: string): this {
    this.config.hintColor = color;
    return this;
  }

  tooltip(text: string): this {
    this.config.tooltip = text;
    return this;
  }

  autofocus(autofocus = true): this {
    this.config.autofocus = autofocus;
    return this;
  }

  prefixIcon(icon: ReactNode): this {
    this.config.prefixIcon = icon;
    return this;
  }

  suffixIcon(icon: ReactNode): this {
    this.config.suffixIcon = icon;
    return this;
  }

  columnSpanFull(full = true): this {
    this.config.columnSpanFull = full;
    return this;
  }

  // --- Validation ---

  /** Custom validator; return an error message (or null/undefined when valid). */
  validate(fn: (value: any, data: TData) => string | null | undefined): this {
    this.config.validate = fn;
    return this;
  }

  // --- Value / submit ---

  /** false → the field is not sent to the server (pure UI field). */
  dehydrated(dehydrated = true): this {
    this.config.dehydrated = dehydrated;
    return this;
  }

  /** Transform the value for display in the field. */
  formatStateUsing(fn: (value: any, data: TData) => any): this {
    this.config.formatStateUsing = fn;
    return this;
  }

  /** Transform the value just before submit. */
  mutateBeforeSave(fn: (value: any, data: TData) => any): this {
    this.config.mutateBeforeSave = fn;
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
