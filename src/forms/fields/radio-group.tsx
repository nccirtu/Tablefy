import React, { ReactNode } from "react";
import {
  RadioGroup as ShadcnRadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BaseField } from "./base-field";
import { RadioGroupConfig, SelectOption } from "../types/field";
import { FieldType, FieldRenderProps } from "../types/form";

export class RadioGroup<
  TData extends Record<string, any>,
> extends BaseField<TData, RadioGroupConfig<TData>> {
  readonly fieldType: FieldType = "radio-group";

  constructor(name: string) {
    super(name);
    (this.config as RadioGroupConfig<TData>).options = [];
    (this.config as RadioGroupConfig<TData>).orientation = "vertical";
  }

  static make<TData extends Record<string, any>>(
    name: string & keyof TData | string,
  ): RadioGroup<TData> {
    return new RadioGroup(name);
  }

  options(options: SelectOption[]): this {
    (this.config as RadioGroupConfig<TData>).options = options;
    return this;
  }

  orientation(orientation: "horizontal" | "vertical"): this {
    (this.config as RadioGroupConfig<TData>).orientation = orientation;
    return this;
  }

  horizontal(): this {
    return this.orientation("horizontal");
  }

  vertical(): this {
    return this.orientation("vertical");
  }

  renderField({
    value,
    onChange,
    error,
    disabled,
  }: FieldRenderProps<TData>): ReactNode {
    const cfg = this.config as RadioGroupConfig<TData>;
    const isHorizontal = cfg.orientation === "horizontal";

    return (
      <ShadcnRadioGroup
        value={value ?? ""}
        onValueChange={onChange}
        disabled={disabled}
        className={cn(
          isHorizontal ? "flex flex-row gap-4" : "flex flex-col gap-2",
          cfg.className,
        )}
      >
        {cfg.options.map((opt) => (
          <div key={opt.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={opt.value}
              id={`${cfg.name}-${opt.value}`}
              disabled={opt.disabled}
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
      </ShadcnRadioGroup>
    );
  }
}
