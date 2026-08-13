"use client";
import React, { ReactNode } from "react";
import { FormItemConfig } from "../types/layout";
import { BuiltField } from "../types/form";
import { FieldRenderer } from "./field-renderer";
import { GridLayout } from "./grid-layout";

export interface FormContentProps<TData extends Record<string, any>> {
  /** Ordered items: fields (by name), explicit rows, or arbitrary nodes. */
  items: FormItemConfig[];
  columns?: number;
  fields: BuiltField<TData>[];
  data: TData;
  errors: Partial<Record<keyof TData, string>>;
  onChange: (field: keyof TData, value: any) => void;
  onBlur?: (field: string) => void;
  isFieldVisible: (field: BuiltField<TData>) => boolean;
  isFieldDisabled: (field: BuiltField<TData>) => boolean;
}

/**
 * Renders an ordered list of form items. Consecutive fields share a
 * `columns`-grid; explicit rows get their own grid; nodes (Alert, image, …)
 * render full-width and break the grid run.
 */
export function FormContent<TData extends Record<string, any>>({
  items,
  columns,
  fields,
  data,
  errors,
  onChange,
  onBlur,
  isFieldVisible,
  isFieldDisabled,
}: FormContentProps<TData>): ReactNode {
  const fieldByName = (name: string) => fields.find((f) => f.name === name);

  const renderField = (field: BuiltField<TData> | undefined): ReactNode => {
    if (!field || !isFieldVisible(field)) return null;
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
  };

  const blocks: ReactNode[] = [];
  let run: ReactNode[] = [];
  const flush = (key: string | number) => {
    if (run.length) {
      blocks.push(
        <GridLayout key={`g-${key}`} columns={columns}>
          {run}
        </GridLayout>,
      );
      run = [];
    }
  };

  items.forEach((item, i) => {
    if (item.kind === "field") {
      run.push(renderField(fieldByName(item.name)));
    } else if (item.kind === "row") {
      flush(i);
      blocks.push(
        <GridLayout key={`r-${i}`} columns={item.columns ?? item.fields.length}>
          {item.fields.map((n) => renderField(fieldByName(n)))}
        </GridLayout>,
      );
    } else {
      flush(i);
      blocks.push(<React.Fragment key={`n-${i}`}>{item.node}</React.Fragment>);
    }
  });
  flush("end");

  if (blocks.length === 1) return blocks[0];
  return <div className="space-y-4">{blocks}</div>;
}
