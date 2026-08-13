"use client";
import React, { ReactNode, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { SectionConfig } from "../types/layout";
import { BuiltField } from "../types/form";
import { FormContent } from "./form-content";

export interface SectionRendererProps<TData extends Record<string, any>> {
  section: SectionConfig<TData>;
  fields: BuiltField<TData>[];
  data: TData;
  errors: Partial<Record<keyof TData, string>>;
  onChange: (field: keyof TData, value: any) => void;
  onBlur?: (field: string) => void;
  isFieldVisible: (field: BuiltField<TData>) => boolean;
  isFieldDisabled: (field: BuiltField<TData>) => boolean;
}

export function SectionRenderer<TData extends Record<string, any>>({
  section,
  fields,
  data,
  errors,
  onChange,
  onBlur,
  isFieldVisible,
  isFieldDisabled,
}: SectionRendererProps<TData>): ReactNode {
  const [isCollapsed, setIsCollapsed] = useState(section.collapsed ?? false);

  if (section.hidden && section.hidden(data)) return null;

  return (
    <Card>
      <CardHeader
        className={cn(
          section.collapsible && "cursor-pointer select-none",
        )}
        onClick={
          section.collapsible ? () => setIsCollapsed(!isCollapsed) : undefined
        }
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {section.icon}
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </div>
          {section.collapsible && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "-rotate-90",
                )}
              />
            </Button>
          )}
        </div>
        {section.description && (
          <CardDescription>{section.description}</CardDescription>
        )}
      </CardHeader>
      {!isCollapsed && (
        <CardContent>
          <FormContent
            items={section.items}
            columns={section.columns}
            fields={fields}
            data={data}
            errors={errors}
            onChange={onChange}
            onBlur={onBlur}
            isFieldVisible={isFieldVisible}
            isFieldDisabled={isFieldDisabled}
          />
        </CardContent>
      )}
    </Card>
  );
}
