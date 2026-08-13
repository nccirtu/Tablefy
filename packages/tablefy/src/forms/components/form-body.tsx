"use client";
import React, { ReactNode } from "react";
import { FormBodyItemConfig, FormItemConfig } from "../types/layout";
import { BuiltField } from "../types/form";
import { FormContent } from "./form-content";
import { SectionRenderer } from "./section-renderer";

export interface FormBodyProps<TData extends Record<string, any>> {
  /** Ordered items: Sections, fields, rows, or arbitrary nodes. */
  items: FormBodyItemConfig<TData>[];
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
 * Renders a form body / tab / step: Sections become Cards; runs of non-section
 * items (fields, rows, nodes) render together via FormContent, preserving order.
 */
export function FormBody<TData extends Record<string, any>>({
  items,
  columns,
  fields,
  data,
  errors,
  onChange,
  onBlur,
  isFieldVisible,
  isFieldDisabled,
}: FormBodyProps<TData>): ReactNode {
  const ctx = {
    fields,
    data,
    errors,
    onChange,
    onBlur,
    isFieldVisible,
    isFieldDisabled,
  };

  const blocks: ReactNode[] = [];
  let buffer: FormItemConfig[] = [];
  const flush = (key: string | number) => {
    if (buffer.length) {
      blocks.push(
        <FormContent key={`c-${key}`} items={buffer} columns={columns} {...ctx} />,
      );
      buffer = [];
    }
  };

  items.forEach((item, i) => {
    if (item.kind === "section") {
      flush(i);
      blocks.push(
        <SectionRenderer key={item.section.id} section={item.section} {...ctx} />,
      );
    } else {
      buffer.push(item);
    }
  });
  flush("end");

  return <div className="space-y-4">{blocks}</div>;
}
