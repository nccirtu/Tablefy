import React, { ReactNode } from "react";
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BaseField } from "./base-field";
import { CheckboxGroupConfig, SelectOption } from "../types/field";
import { FieldType, FieldRenderProps } from "../types/form";

export class CheckboxGroup<
  TData extends Record<string, any>,
> extends BaseField<TData, CheckboxGroupConfig<TData>> {
  readonly fieldType: FieldType = "checkbox-group";

  constructor(name: string) {
    super(name);
    (this.config as CheckboxGroupConfig<TData>).options = [];
    (this.config as CheckboxGroupConfig<TData>).columns = 1;
  }

  static make<TData extends Record<string, any>>(
    name: string & keyof TData | string,
  ): CheckboxGroup<TData> {
    return new CheckboxGroup(name);
  }

  options(options: SelectOption[]): this {
    (this.config as CheckboxGroupConfig<TData>).options = options;
    return this;
  }

  columns(columns: number): this {
    (this.config as CheckboxGroupConfig<TData>).columns = columns;
    return this;
  }

  renderField({
    value,
    onChange,
    error,
    disabled,
  }: FieldRenderProps<TData>): ReactNode {
    const cfg = this.config as CheckboxGroupConfig<TData>;
    const selectedValues: string[] = Array.isArray(value) ? value : [];

    const gridColsClass: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
    };

    const handleToggle = (optionValue: string, checked: boolean) => {
      if (checked) {
        onChange([...selectedValues, optionValue]);
      } else {
        onChange(selectedValues.filter((v) => v !== optionValue));
      }
    };

    return (
      <div
        className={cn(
          "grid gap-2",
          gridColsClass[cfg.columns || 1] || gridColsClass[1],
          cfg.className,
        )}
      >
        {cfg.options.map((opt) => (
          <div key={opt.value} className="flex items-center space-x-2">
            <ShadcnCheckbox
              id={`${cfg.name}-${opt.value}`}
              checked={selectedValues.includes(opt.value)}
              onCheckedChange={(checked) =>
                handleToggle(opt.value, !!checked)
              }
              disabled={disabled || opt.disabled}
              className={cn(error && "border-destructive")}
            />
            <Label
              htmlFor={`${cfg.name}-${opt.value}`}
              className="text-sm font-normal"
            >
              {opt.label}
            </Label>
          </div>
        ))}
      </div>
    );
  }
}
