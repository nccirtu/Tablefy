"use client";
import React, { ReactNode, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { BaseField } from "./base-field";
import { RepeaterConfig } from "../types/field";
import { FieldType, FieldRenderProps, BuiltField } from "../types/form";

type FieldBuilder<TData extends Record<string, any>> = {
  build(): BuiltField<TData>;
};

export class Repeater<
  TData extends Record<string, any>,
> extends BaseField<TData, RepeaterConfig<TData>> {
  readonly fieldType: FieldType = "repeater";
  private fieldBuilders: FieldBuilder<any>[] = [];

  constructor(name: string) {
    super(name);
    (this.config as RepeaterConfig<TData>).minItems = 0;
    (this.config as RepeaterConfig<TData>).maxItems = Infinity;
    (this.config as RepeaterConfig<TData>).addLabel = "Add item";
    (this.config as RepeaterConfig<TData>).collapsible = false;
    (this.config as RepeaterConfig<TData>).orderable = false;
  }

  static make<TData extends Record<string, any>>(
    name: string & keyof TData | string,
  ): Repeater<TData> {
    return new Repeater(name);
  }

  fields(...builders: FieldBuilder<any>[]): this {
    this.fieldBuilders = builders;
    (this.config as RepeaterConfig<TData>).fields = builders.map((b) =>
      b.build(),
    );
    return this;
  }

  minItems(min: number): this {
    (this.config as RepeaterConfig<TData>).minItems = min;
    return this;
  }

  maxItems(max: number): this {
    (this.config as RepeaterConfig<TData>).maxItems = max;
    return this;
  }

  addLabel(label: string): this {
    (this.config as RepeaterConfig<TData>).addLabel = label;
    return this;
  }

  collapsible(collapsible = true): this {
    (this.config as RepeaterConfig<TData>).collapsible = collapsible;
    return this;
  }

  orderable(orderable = true): this {
    (this.config as RepeaterConfig<TData>).orderable = orderable;
    return this;
  }

  renderField({
    value,
    onChange,
    error,
    disabled,
    data,
  }: FieldRenderProps<TData>): ReactNode {
    const cfg = this.config as RepeaterConfig<TData>;
    const items: Record<string, any>[] = Array.isArray(value) ? value : [];
    const builtFields = cfg.fields as BuiltField<any>[];

    const addItem = () => {
      if (items.length >= (cfg.maxItems || Infinity)) return;
      const defaults: Record<string, any> = {};
      builtFields.forEach((f) => {
        defaults[f.name] = f.config.defaultValue ?? "";
      });
      onChange([...items, defaults]);
    };

    const removeItem = (index: number) => {
      if (items.length <= (cfg.minItems || 0)) return;
      onChange(items.filter((_, i) => i !== index));
    };

    const updateItem = (
      index: number,
      fieldName: string,
      fieldValue: any,
    ) => {
      const updated = items.map((item, i) =>
        i === index ? { ...item, [fieldName]: fieldValue } : item,
      );
      onChange(updated);
    };

    const canAdd = items.length < (cfg.maxItems || Infinity);
    const canRemove = items.length > (cfg.minItems || 0);

    return (
      <div className={cn("space-y-3", cfg.className)}>
        {items.map((item, index) => (
          <Card key={index}>
            <CardContent className="flex items-start gap-3 pt-4">
              {cfg.orderable && (
                <GripVertical className="mt-2 h-5 w-5 cursor-grab text-muted-foreground" />
              )}
              <div className="grid flex-1 gap-3">
                {builtFields.map((field) => (
                  <div key={field.name} className="space-y-1">
                    {field.config.label && (
                      <label className="text-sm font-medium">
                        {field.config.label}
                      </label>
                    )}
                    {field.render({
                      value: item[field.name],
                      onChange: (v) => updateItem(index, field.name, v),
                      disabled,
                      data,
                    })}
                  </div>
                ))}
              </div>
              {canRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-8 w-8 p-0 text-destructive"
                  onClick={() => removeItem(index)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {canAdd && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            disabled={disabled}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            {cfg.addLabel}
          </Button>
        )}
      </div>
    );
  }
}
