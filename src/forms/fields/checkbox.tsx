import React, { ReactNode } from "react";
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { BaseField } from "./base-field";
import { CheckboxConfig } from "../types/field";
import { FieldType, FieldRenderProps } from "../types/form";

export class Checkbox<
  TData extends Record<string, any>,
> extends BaseField<TData, CheckboxConfig<TData>> {
  readonly fieldType: FieldType = "checkbox";

  static make<TData extends Record<string, any>>(
    name: string & keyof TData | string,
  ): Checkbox<TData> {
    return new Checkbox(name);
  }

  renderField({
    value,
    onChange,
    error,
    disabled,
  }: FieldRenderProps<TData>): ReactNode {
    const { className } = this.config;

    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <ShadcnCheckbox
          id={this.config.name}
          checked={!!value}
          onCheckedChange={(checked) => onChange(!!checked)}
          disabled={disabled}
          className={cn(error && "border-destructive")}
        />
        {this.config.label && (
          <label
            htmlFor={this.config.name}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error && "text-destructive",
            )}
          >
            {this.config.label}
          </label>
        )}
      </div>
    );
  }
}
