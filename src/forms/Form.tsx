"use client";
import { FormEvent, ReactNode } from "react";
import { FormConfig } from "./types/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface FormProps<TData = any> {
  schema: FormConfig<TData>;
  data: TData;
  errors?: Partial<Record<keyof TData, string>>;
  onChange: (field: keyof TData, value: any) => void;
  onSubmit: () => void;
  processing?: boolean;
  className?: string;
}

export function Form<TData = any>({
  schema,
  data,
  errors = {},
  onChange,
  onSubmit,
  processing = false,
  className,
}: FormProps<TData>) {
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(
    new Set(
      schema.sections
        ?.map((section, index) => (section.collapsed ? index : -1))
        .filter((i) => i !== -1) || [],
    ),
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const toggleSection = (index: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const renderField = (fieldName: keyof TData & string) => {
    const fieldDef = schema.fields.get(fieldName);
    if (!fieldDef) return null;

    const field = fieldDef.config;
    const value = data[fieldName];
    const error = errors[fieldName];

    // Check dependencies
    if (field.dependsOn) {
      const dependentValue = data[field.dependsOn.field];
      if (!field.dependsOn.condition(dependentValue)) {
        return null;
      }
    }

    return (
      <div
        key={fieldName}
        className={cn(
          "w-full",
          field.columnSpan && `col-span-${field.columnSpan}`,
        )}
      >
        {fieldDef.render({
          field,
          value,
          error,
          onChange: (newValue) => onChange(fieldName, newValue),
          data,
        })}
      </div>
    );
  };

  const renderFields = (fieldNames: (keyof TData & string)[]) => {
    return fieldNames.map((fieldName) => renderField(fieldName));
  };

  const renderSection = (
    section: (typeof schema.sections)[0],
    index: number,
  ) => {
    const isCollapsed = collapsedSections.has(index);

    return (
      <div key={index} className="space-y-4">
        {section.title && (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{section.title}</h3>
              {section.description && (
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              )}
            </div>
            {section.collapsible && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => toggleSection(index)}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        )}

        {!isCollapsed && (
          <div
            className={cn(
              "grid gap-4",
              section.columns && `grid-cols-${section.columns}`,
            )}
          >
            {renderFields(section.fields)}
          </div>
        )}

        {index < (schema.sections?.length || 0) - 1 && <Separator />}
      </div>
    );
  };

  const renderActions = () => {
    if (!schema.actions || schema.actions.length === 0) return null;

    const justifyClass = {
      start: "justify-start",
      end: "justify-end",
      between: "justify-between",
      center: "justify-center",
    }[schema.actionsPosition || "end"];

    return (
      <div className={cn("flex gap-2", justifyClass)}>
        {schema.actions.map((action, index) => (
          <Button
            key={index}
            type={action.type === "submit" ? "submit" : "button"}
            variant={action.variant || "default"}
            disabled={
              action.disabled || (action.type === "submit" && processing)
            }
            onClick={action.onClick}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.loading || (action.type === "submit" && processing)
              ? "Loading..."
              : action.label}
          </Button>
        ))}
      </div>
    );
  };

  const title =
    typeof schema.title === "function" ? schema.title(data) : schema.title;
  const description =
    typeof schema.description === "function"
      ? schema.description(data)
      : schema.description;

  const spacingClass = {
    compact: "space-y-4",
    normal: "space-y-6",
    relaxed: "space-y-8",
  }[schema.spacing || "normal"];

  const content = (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className={spacingClass}>
        {/* Header */}
        {(title || description) && (
          <div className="space-y-2">
            {title && <h2 className="text-2xl font-bold">{title}</h2>}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        {/* Sections or Fields */}
        {schema.sections && schema.sections.length > 0 ? (
          <div className={spacingClass}>
            {schema.sections.map((section, index) =>
              renderSection(section, index),
            )}
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-4",
              schema.columns && `grid-cols-${schema.columns}`,
            )}
          >
            {Array.from(schema.fields.keys()).map((fieldName) =>
              renderField(fieldName),
            )}
          </div>
        )}

        {/* Actions */}
        {renderActions()}
      </div>
    </form>
  );

  if (schema.bordered) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className={spacingClass}>
          {schema.sections && schema.sections.length > 0 ? (
            <div className={spacingClass}>
              {schema.sections.map((section, index) =>
                renderSection(section, index),
              )}
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-4",
                schema.columns && `grid-cols-${schema.columns}`,
              )}
            >
              {Array.from(schema.fields.keys()).map((fieldName) =>
                renderField(fieldName),
              )}
            </div>
          )}
        </CardContent>
        {schema.actions && schema.actions.length > 0 && (
          <CardFooter>{renderActions()}</CardFooter>
        )}
      </Card>
    );
  }

  return content;
}
