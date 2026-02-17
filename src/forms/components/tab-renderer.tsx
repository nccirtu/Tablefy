"use client";
import React, { ReactNode } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TabConfig } from "../types/layout";
import { BuiltField } from "../types/form";
import { FieldRenderer } from "./field-renderer";
import { SectionRenderer } from "./section-renderer";
import { GridLayout } from "./grid-layout";

export interface TabRendererProps<TData extends Record<string, any>> {
  tabs: TabConfig<TData>[];
  fields: BuiltField<TData>[];
  data: TData;
  errors: Partial<Record<keyof TData, string>>;
  onChange: (field: keyof TData, value: any) => void;
  onBlur?: (field: string) => void;
  isFieldVisible: (field: BuiltField<TData>) => boolean;
  isFieldDisabled: (field: BuiltField<TData>) => boolean;
  columns?: number;
}

export function TabRenderer<TData extends Record<string, any>>({
  tabs,
  fields,
  data,
  errors,
  onChange,
  onBlur,
  isFieldVisible,
  isFieldDisabled,
  columns,
}: TabRendererProps<TData>): ReactNode {
  const firstTab = tabs[0]?.id;

  return (
    <Tabs defaultValue={firstTab}>
      <TabsList>
        {tabs.map((tab) => {
          const isDisabled = tab.disabled ? tab.disabled(data) : false;
          const badge =
            typeof tab.badge === "function" ? tab.badge(data) : tab.badge;

          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={isDisabled}
            >
              <span className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
                {badge !== undefined && badge !== null && (
                  <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                    {badge}
                  </span>
                )}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {tabs.map((tab) => {
        const tabFields = tab.fields
          ? fields.filter((f) => tab.fields!.includes(f.name))
          : [];

        return (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            {tab.sections ? (
              <div className="space-y-4">
                {tab.sections.map((section) => (
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
            ) : (
              <GridLayout columns={columns}>
                {tabFields.map((field) => {
                  if (!isFieldVisible(field)) return null;
                  return (
                    <FieldRenderer
                      key={field.name}
                      field={field}
                      value={data[field.name as keyof TData]}
                      error={errors[field.name as keyof TData]}
                      disabled={isFieldDisabled(field)}
                      data={data}
                      onChange={(v) =>
                        onChange(field.name as keyof TData, v)
                      }
                      onBlur={
                        onBlur ? () => onBlur(field.name) : undefined
                      }
                    />
                  );
                })}
              </GridLayout>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
