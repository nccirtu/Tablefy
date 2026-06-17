import React, { ReactNode } from "react";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BaseField } from "./base-field";
import { TextareaConfig } from "../types/field";
import { FieldType, FieldRenderProps } from "../types/form";

export class Textarea<
  TData extends Record<string, any>,
> extends BaseField<TData, TextareaConfig<TData>> {
  readonly fieldType: FieldType = "textarea";

  constructor(name: string) {
    super(name);
    this.config.rows = 3;
  }

  static make<TData extends Record<string, any>>(
    name: string & keyof TData | string,
  ): Textarea<TData> {
    return new Textarea(name);
  }

  rows(rows: number): this {
    this.config.rows = rows;
    return this;
  }

  minLength(min: number): this {
    this.config.minLength = min;
    this.config.rules = [
      ...(this.config.rules || []),
      {
        type: "min",
        value: min,
        message: `${this.config.label || this.config.name} must be at least ${min} characters`,
      },
    ];
    return this;
  }

  maxLength(max: number): this {
    this.config.maxLength = max;
    this.config.rules = [
      ...(this.config.rules || []),
      {
        type: "max",
        value: max,
        message: `${this.config.label || this.config.name} must be at most ${max} characters`,
      },
    ];
    return this;
  }

  autoResize(autoResize = true): this {
    this.config.autoResize = autoResize;
    return this;
  }

  renderField({
    value,
    onChange,
    onBlur,
    error,
    disabled,
  }: FieldRenderProps<TData>): ReactNode {
    const { placeholder, rows, maxLength, readOnly, className } = this.config;

    return (
      <ShadcnTextarea
        value={value ?? ""}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        className={cn(error && "border-destructive", className)}
      />
    );
  }
}
