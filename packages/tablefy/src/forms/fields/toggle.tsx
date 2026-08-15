import React, { ReactNode } from "react";
import { Label } from "@/components/ui/label";
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
    const { onLabel, offLabel, className, label, helperText, name } =
      this.config;

    // The switch carries its own header: the shared field renderer skips the
    // label for toggles, so without this the field would appear unlabelled.
    // Layout follows the design — text left, switch right, in its own box.
    const stateLabel = value ? onLabel : offLabel;

    return (
      <div
        className={cn(
          "flex items-center justify-between gap-4 rounded-md border p-3",
          className,
        )}
      >
        <div className="space-y-1.5">
          {label && (
            <Label
              htmlFor={name}
              className={cn(error && "text-destructive")}
            >
              {label}
            </Label>
          )}
          {helperText && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
          {stateLabel && (
            <p className="text-xs text-muted-foreground">{stateLabel}</p>
          )}
        </div>

        <Switch
          id={name}
          checked={!!value}
          onCheckedChange={(checked) => onChange(checked)}
          disabled={disabled}
          className={cn(error && "border-destructive")}
        />
      </div>
    );
  }
}
