import React, { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BaseField } from "./base-field";
import { TextInputConfig } from "../types/field";
import { FieldType, FieldRenderProps } from "../types/form";

export class TextInput<
  TData extends Record<string, any>,
> extends BaseField<TData, TextInputConfig<TData>> {
  readonly fieldType: FieldType = "text";

  static make<TData extends Record<string, any>>(
    name: string & keyof TData | string,
  ): TextInput<TData> {
    return new TextInput(name);
  }

  type(type: "text" | "email" | "password" | "number" | "url" | "tel"): this {
    this.config.type = type;
    return this;
  }

  email(): this {
    return this.type("email");
  }

  password(): this {
    return this.type("password");
  }

  number(): this {
    return this.type("number");
  }

  url(): this {
    return this.type("url");
  }

  tel(): this {
    return this.type("tel");
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

  prefix(prefix: string | ReactNode): this {
    this.config.prefix = prefix;
    return this;
  }

  suffix(suffix: string | ReactNode): this {
    this.config.suffix = suffix;
    return this;
  }

  autocomplete(value: string): this {
    this.config.autocomplete = value;
    return this;
  }

  renderField({
    value,
    onChange,
    onBlur,
    error,
    disabled,
  }: FieldRenderProps<TData>): ReactNode {
    const {
      type,
      placeholder,
      maxLength,
      readOnly,
      autocomplete,
      className,
      prefix,
      suffix,
    } = this.config;

    const input = (
      <Input
        type={type || "text"}
        value={value ?? ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(
            type === "number" ? Number(e.target.value) : e.target.value,
          )
        }
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete={autocomplete}
        className={cn(error && "border-destructive", className)}
      />
    );

    if (prefix || suffix) {
      return (
        <div className="flex items-center gap-2">
          {prefix && (
            <span className="text-sm text-muted-foreground">{prefix}</span>
          )}
          {input}
          {suffix && (
            <span className="text-sm text-muted-foreground">{suffix}</span>
          )}
        </div>
      );
    }

    return input;
  }
}
