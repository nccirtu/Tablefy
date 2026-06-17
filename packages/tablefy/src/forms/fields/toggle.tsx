import React, { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { BaseField } from "./base-field";
import { ToggleConfig } from "../types/field";
import { FieldType, FieldRenderProps } from "../types/form";

export class Toggle<
  TData extends Record<string, any>,
> extends BaseField<TData, ToggleConfig<TData>> {
  readonly fieldType: FieldType = "toggle";

  static make<TData extends Record<string, any>>(
    name: string & keyof TData | string,
  ): Toggle<TData> {
    return new Toggle(name);
  }

  onLabel(label: string): this {
    this.config.onLabel = label;
    return this;
  }

  offLabel(label: string): this {
    this.config.offLabel = label;
    return this;
  }

  renderField({
    value,
    onChange,
    error,
    disabled,
  }: FieldRenderProps<TData>): ReactNode {
    const { onLabel, offLabel, className } = this.config;
    const displayLabel = value ? onLabel : offLabel;

    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Switch
          id={this.config.name}
          checked={!!value}
          onCheckedChange={(checked) => onChange(checked)}
          disabled={disabled}
          className={cn(error && "border-destructive")}
        />
        {displayLabel && (
          <label
            htmlFor={this.config.name}
            className="text-sm text-muted-foreground"
          >
            {displayLabel}
          </label>
        )}
      </div>
    );
  }
}
