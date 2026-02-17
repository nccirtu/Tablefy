"use client";
import React, { ReactNode, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FormBuildResult, BuiltField } from "../types/form";
import { FieldRenderer } from "./field-renderer";
import { GridLayout } from "./grid-layout";
import { FormActions } from "./form-actions";
import { SectionRenderer } from "./section-renderer";
import { TabRenderer } from "./tab-renderer";
import { WizardRenderer } from "./wizard-renderer";

export interface FormRendererProps<TData extends Record<string, any>> {
  schema: FormBuildResult<TData>;
  data: TData;
  errors: Partial<Record<keyof TData, string>>;
  onChange: (field: keyof TData, value: any) => void;
  onSubmit: () => void;
  processing?: boolean;
  className?: string;
  disabled?: boolean;
  onBlur?: (field: string) => void;
}

export function FormRenderer<TData extends Record<string, any>>({
  schema,
  data,
  errors,
  onChange,
  onSubmit,
  processing = false,
  className,
  disabled = false,
  onBlur,
}: FormRendererProps<TData>): ReactNode {
  const { fields, config } = schema;

  const resolvedTitle = useMemo(() => {
    if (typeof config.title === "function") return config.title(data);
    return config.title;
  }, [config.title, data]);

  const resolvedDescription = useMemo(() => {
    if (typeof config.description === "function")
      return config.description(data);
    return config.description;
  }, [config.description, data]);

  const isFieldVisible = useCallback(
    (field: BuiltField<TData>): boolean => {
      if (typeof field.config.hidden === "function")
        return !field.config.hidden(data);
      if (typeof field.config.hidden === "boolean")
        return !field.config.hidden;

      for (const dep of field.config.dependsOn || []) {
        const depValue = data[dep.field as keyof TData];
        if (dep.effect === "show" && !dep.condition(depValue, data))
          return false;
        if (dep.effect === "hide" && dep.condition(depValue, data))
          return false;
      }
      return true;
    },
    [data],
  );

  const isFieldDisabled = useCallback(
    (field: BuiltField<TData>): boolean => {
      if (disabled) return true;
      if (typeof config.disabled === "function" && config.disabled(data))
        return true;
      if (typeof config.disabled === "boolean" && config.disabled) return true;
      if (typeof field.config.disabled === "function")
        return field.config.disabled(data);
      if (typeof field.config.disabled === "boolean")
        return field.config.disabled;

      for (const dep of field.config.dependsOn || []) {
        const depValue = data[dep.field as keyof TData];
        if (dep.effect === "disable" && dep.condition(depValue, data))
          return true;
        if (
          dep.effect === "enable" &&
          !dep.condition(depValue, data)
        )
          return true;
      }
      return false;
    },
    [disabled, config.disabled, data],
  );

  const renderFieldsFlat = () => (
    <GridLayout columns={config.columns}>
      {fields.map((field) => {
        if (!isFieldVisible(field)) return null;
        return (
          <FieldRenderer
            key={field.name}
            field={field}
            value={data[field.name as keyof TData]}
            error={errors[field.name as keyof TData]}
            disabled={isFieldDisabled(field)}
            data={data}
            onChange={(v) => onChange(field.name as keyof TData, v)}
            onBlur={onBlur ? () => onBlur(field.name) : undefined}
          />
        );
      })}
    </GridLayout>
  );

  const renderContent = () => {
    // Wizard mode
    if (config.wizardSteps?.length) {
      return (
        <WizardRenderer
          steps={config.wizardSteps}
          fields={fields}
          data={data}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
          isFieldVisible={isFieldVisible}
          isFieldDisabled={isFieldDisabled}
          columns={config.columns}
          onSubmit={onSubmit}
          processing={processing}
        />
      );
    }

    // Tabs mode
    if (config.tabs?.length) {
      return (
        <TabRenderer
          tabs={config.tabs}
          fields={fields}
          data={data}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
          isFieldVisible={isFieldVisible}
          isFieldDisabled={isFieldDisabled}
          columns={config.columns}
        />
      );
    }

    // Sections mode
    if (config.sections?.length) {
      return (
        <div className="space-y-4">
          {config.sections.map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              fields={fields}
              data={data}
              errors={errors}
              onChange={onChange}
              onBlur={onBlur}
              isFieldVisible={isFieldVisible}
              isFieldDisabled={isFieldDisabled}
            />
          ))}
        </div>
      );
    }

    // Flat mode (default)
    return renderFieldsFlat();
  };

  const spacingClass = {
    compact: "space-y-3",
    normal: "space-y-6",
    relaxed: "space-y-8",
  }[config.spacing || "normal"];

  // Wizard handles its own submit button
  const showActions =
    config.actions?.length && !config.wizardSteps?.length;

  const formBody = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className={cn(spacingClass, className)}
    >
      {(resolvedTitle || resolvedDescription) && (
        <div className="space-y-1">
          {resolvedTitle && (
            <h2 className="text-2xl font-semibold tracking-tight">
              {resolvedTitle}
            </h2>
          )}
          {resolvedDescription && (
            <p className="text-sm text-muted-foreground">
              {resolvedDescription}
            </p>
          )}
        </div>
      )}

      {renderContent()}

      {showActions && (
        <FormActions
          actions={config.actions!}
          position={config.actionsPosition}
          data={data}
          processing={processing}
        />
      )}
    </form>
  );

  if (config.bordered) {
    return (
      <Card>
        <CardContent className="pt-6">{formBody}</CardContent>
      </Card>
    );
  }

  return formBody;
}
