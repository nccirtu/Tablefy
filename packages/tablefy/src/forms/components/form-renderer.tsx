"use client";
import React, { ReactNode, useMemo, useCallback, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FormBuildResult, BuiltField } from "../types/form";
import { FormOperation, FieldStateSetter } from "../types/field";
import { FormActions } from "./form-actions";
import { FormBody } from "./form-body";
import { TabRenderer } from "./tab-renderer";
import { WizardRenderer } from "./wizard-renderer";
import { TablefyDataContext } from "../context";

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
  /** Runtime page props for relationship selects (`Select.optionsFrom(...)`). */
  external?: Record<string, unknown>;
  /** Active operation — drives `visibleOn`/`hiddenOn`/`disabledOn`. */
  operation?: FormOperation;
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
  external,
  operation,
}: FormRendererProps<TData>): ReactNode {
  const { fields, config } = schema;
  const formRef = useRef<HTMLDivElement>(null);

  // A form long enough to scroll can fail entirely below the fold: the request
  // comes back, nothing visibly happens, and the message sits behind the
  // footer. Bring the first failing field to the reader instead.
  const errorCount = Object.keys(errors).length;

  useEffect(() => {
    if (errorCount === 0) return;

    formRef.current
      ?.querySelector("[data-field-error]")
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [errorCount, errors]);

  const fieldByName = useMemo(() => {
    const map: Record<string, BuiltField<TData>> = {};
    for (const f of fields) map[f.name] = f;
    return map;
  }, [fields]);

  // Wrap onChange so reactive side effects (`afterStateUpdated`) fire — once,
  // regardless of layout mode (flat / sections / tabs / wizard).
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );
  const handleChange = useCallback(
    (field: keyof TData, value: any) => {
      onChange(field, value);
      const built = fieldByName[field as string];
      const after = built?.config.afterStateUpdated;
      if (!after) return;
      const nextData = { ...data, [field]: value } as TData;
      const set: FieldStateSetter = (f, v) => onChange(f as keyof TData, v);
      const run = () => after(value, set, nextData);
      const ms = built?.config.debounce;
      if (ms) {
        clearTimeout(debounceTimers.current[field as string]);
        debounceTimers.current[field as string] = setTimeout(run, ms);
      } else {
        run();
      }
    },
    [onChange, data, fieldByName],
  );

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
      const h = field.config.hidden;
      if (typeof h === "function" ? h(data) : h === true) return false;

      if (operation) {
        if (
          field.config.visibleOn &&
          !field.config.visibleOn.includes(operation)
        )
          return false;
        if (field.config.hiddenOn?.includes(operation)) return false;
      }

      for (const dep of field.config.dependsOn || []) {
        const depValue = data[dep.field as keyof TData];
        if (dep.effect === "show" && !dep.condition(depValue, data))
          return false;
        if (dep.effect === "hide" && dep.condition(depValue, data))
          return false;
      }
      return true;
    },
    [data, operation],
  );

  const isFieldDisabled = useCallback(
    (field: BuiltField<TData>): boolean => {
      if (disabled) return true;
      const fd = config.disabled;
      if (typeof fd === "function" ? fd(data) : fd === true) return true;

      const d = field.config.disabled;
      if (typeof d === "function" ? d(data) : d === true) return true;

      const ro = field.config.readOnly;
      if (typeof ro === "function" ? ro(data) : ro === true) return true;

      if (operation && field.config.disabledOn?.includes(operation)) return true;

      for (const dep of field.config.dependsOn || []) {
        const depValue = data[dep.field as keyof TData];
        if (dep.effect === "disable" && dep.condition(depValue, data))
          return true;
        if (dep.effect === "enable" && !dep.condition(depValue, data))
          return true;
      }
      return false;
    },
    [disabled, config.disabled, data, operation],
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
          onChange={handleChange}
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
          onChange={handleChange}
          onBlur={onBlur}
          isFieldVisible={isFieldVisible}
          isFieldDisabled={isFieldDisabled}
          columns={config.columns}
        />
      );
    }

    // Body mode (default): ordered sections / fields / rows / nodes.
    return (
      <FormBody
        items={config.body ?? []}
        columns={config.columns}
        fields={fields}
        data={data}
        errors={errors}
        onChange={handleChange}
        onBlur={onBlur}
        isFieldVisible={isFieldVisible}
        isFieldDisabled={isFieldDisabled}
      />
    );
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

  const content = config.bordered ? (
    <Card>
      <CardContent className="pt-6">{formBody}</CardContent>
    </Card>
  ) : (
    formBody
  );

  return (
    <TablefyDataContext.Provider value={external ?? {}}>
      <div ref={formRef}>{content}</div>
    </TablefyDataContext.Provider>
  );
}
