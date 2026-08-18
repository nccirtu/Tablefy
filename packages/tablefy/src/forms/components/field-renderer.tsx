import React, { ReactNode, useContext } from "react";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BuiltField, FieldRenderProps } from "../types/form";
import { TablefyDataContext } from "../context";

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
  const external = useContext(TablefyDataContext);

  // Hidden fields render without wrapper
  if (field.type === "hidden") {
    return field.render({ value, onChange, onBlur, error, disabled, data, external });
  }

  // Checkbox and Toggle handle their own labels inline
  // These field types draw their own header — label and helper text sit
  // inside the control, so the shared header would duplicate them.
  const skipLabel = field.type === "checkbox" || field.type === "toggle";
  const skipHelper = field.type === "toggle";

  const required =
    typeof field.config.required === "function"
      ? field.config.required(data)
      : field.config.required === true;

  const { hint, hintIcon, hintColor, tooltip } = field.config;
  const showHeader = !skipLabel && (field.config.label || hint);

  return (
    <div
      className={cn(
        "space-y-2",
        field.config.columnSpanFull
          ? "col-span-full"
          : field.config.columnSpan && field.config.columnSpan > 1
            ? `col-span-${field.config.columnSpan}`
            : undefined,
        field.config.className,
      )}
    >
      {showHeader && (
        <div className="flex items-center justify-between gap-2">
          {field.config.label ? (
            <Label
              htmlFor={field.name}
              className={cn("flex items-center gap-1", error && "text-destructive")}
            >
              {field.config.label}
              {required && <span className="text-destructive">*</span>}
              {tooltip && (
                <span
                  title={tooltip}
                  className="inline-flex cursor-help text-muted-foreground"
                >
                  <Info className="h-3.5 w-3.5" />
                </span>
              )}
            </Label>
          ) : (
            <span />
          )}
          {hint && (
            <span
              className="flex items-center gap-1 text-xs text-muted-foreground"
              style={hintColor ? { color: hintColor } : undefined}
            >
              {hintIcon}
              {hint}
            </span>
          )}
        </div>
      )}
      {field.render({
        value,
        onChange,
        onBlur,
        error,
        disabled,
        data,
        external,
      })}
      {error && (
        // Marked so the form can bring the first failing field into view — a
        // message below the fold is a message nobody reads.
        <p data-field-error className="text-sm text-destructive">
          {error}
        </p>
      )}
      {!error && !skipHelper && field.config.helperText && (
        <p className="text-sm text-muted-foreground">
          {field.config.helperText}
        </p>
      )}
    </div>
  );
}
