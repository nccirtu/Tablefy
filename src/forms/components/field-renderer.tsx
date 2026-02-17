import React, { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BuiltField, FieldRenderProps } from "../types/form";

export interface FieldRendererProps<TData extends Record<string, any>> {
  field: BuiltField<TData>;
  value: any;
  error?: string;
  disabled?: boolean;
  data: TData;
  onChange: (value: any) => void;
  onBlur?: () => void;
}

export function FieldRenderer<TData extends Record<string, any>>({
  field,
  value,
  error,
  disabled,
  data,
  onChange,
  onBlur,
}: FieldRendererProps<TData>): ReactNode {
  // Hidden fields render without wrapper
  if (field.type === "hidden") {
    return field.render({ value, onChange, onBlur, error, disabled, data });
  }

  // Checkbox and Toggle handle their own labels inline
  const skipLabel = field.type === "checkbox" || field.type === "toggle";

  return (
    <div
      className={cn(
        "space-y-2",
        field.config.columnSpan && field.config.columnSpan > 1
          ? `col-span-${field.config.columnSpan}`
          : undefined,
        field.config.className,
      )}
    >
      {field.config.label && !skipLabel && (
        <Label
          htmlFor={field.name}
          className={cn(error && "text-destructive")}
        >
          {field.config.label}
          {field.config.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
      )}
      {field.render({
        value,
        onChange,
        onBlur,
        error,
        disabled,
        data,
      })}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!error && field.config.helperText && (
        <p className="text-sm text-muted-foreground">
          {field.config.helperText}
        </p>
      )}
    </div>
  );
}
