import React, { ReactNode } from "react";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BaseField } from "./base-field";
import { SelectConfig, SelectOption } from "../types/field";
import { FieldType, FieldRenderProps } from "../types/form";

export class Select<
  TData extends Record<string, any>,
> extends BaseField<TData, SelectConfig<TData>> {
  readonly fieldType: FieldType = "select";

  constructor(name: string) {
    super(name);
    (this.config as SelectConfig<TData>).options = [];
    (this.config as SelectConfig<TData>).multiple = false;
    (this.config as SelectConfig<TData>).searchable = false;
    (this.config as SelectConfig<TData>).clearable = false;
  }

  static make<TData extends Record<string, any>>(
    name: string & keyof TData | string,
  ): Select<TData> {
    return new Select(name);
  }

  options(
    options: SelectOption[] | ((data: TData) => SelectOption[]),
  ): this {
    (this.config as SelectConfig<TData>).options = options;
    return this;
  }

  multiple(multiple = true): this {
    (this.config as SelectConfig<TData>).multiple = multiple;
    return this;
  }

  searchable(searchable = true): this {
    (this.config as SelectConfig<TData>).searchable = searchable;
    return this;
  }

  clearable(clearable = true): this {
    (this.config as SelectConfig<TData>).clearable = clearable;
    return this;
  }

  maxItems(max: number): this {
    (this.config as SelectConfig<TData>).maxItems = max;
    return this;
  }

  loadOptions(fn: (query: string) => Promise<SelectOption[]>): this {
    (this.config as SelectConfig<TData>).loadOptions = fn;
    return this;
  }

  renderField({
    value,
    onChange,
    error,
    disabled,
    data,
  }: FieldRenderProps<TData>): ReactNode {
    const cfg = this.config as SelectConfig<TData>;
    const resolvedOptions =
      typeof cfg.options === "function" ? cfg.options(data) : cfg.options;

    return (
      <ShadcnSelect
        value={value ?? ""}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(error && "border-destructive", cfg.className)}
        >
          <SelectValue placeholder={cfg.placeholder || "Select..."} />
        </SelectTrigger>
        <SelectContent>
          {resolvedOptions.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>
    );
  }
}
