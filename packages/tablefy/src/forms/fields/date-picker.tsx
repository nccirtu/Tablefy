import React, { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { BaseField } from "./base-field";
import { DatePickerConfig } from "../types/field";
import { FieldType, FieldRenderProps } from "../types/form";

export class DatePicker<
  TData extends Record<string, any>,
> extends BaseField<TData, DatePickerConfig<TData>> {
  readonly fieldType: FieldType = "date-picker";

  constructor(name: string) {
    super(name);
    this.config.format = "PPP";
    this.config.includeTime = false;
    this.config.locale = "en-US";
  }

  static make<TData extends Record<string, any>>(
    name: string & keyof TData | string,
  ): DatePicker<TData> {
    return new DatePicker(name);
  }

  minDate(date: Date | ((data: TData) => Date)): this {
    this.config.minDate = date;
    return this;
  }

  maxDate(date: Date | ((data: TData) => Date)): this {
    this.config.maxDate = date;
    return this;
  }

  format(format: string): this {
    this.config.format = format;
    return this;
  }

  includeTime(includeTime = true): this {
    this.config.includeTime = includeTime;
    if (includeTime) {
      (this as any).fieldType = "date-time-picker";
    }
    return this;
  }

  locale(locale: string): this {
    this.config.locale = locale;
    return this;
  }

  renderField({
    value,
    onChange,
    error,
    disabled,
    data,
  }: FieldRenderProps<TData>): ReactNode {
    const { placeholder, className, locale } = this.config;

    const resolvedMinDate =
      typeof this.config.minDate === "function"
        ? this.config.minDate(data)
        : this.config.minDate;
    const resolvedMaxDate =
      typeof this.config.maxDate === "function"
        ? this.config.maxDate(data)
        : this.config.maxDate;

    const dateValue = value ? new Date(value) : undefined;

    const formatDate = (date: Date): string => {
      return date.toLocaleDateString(locale || "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateValue && "text-muted-foreground",
              error && "border-destructive",
              className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? formatDate(dateValue) : placeholder || "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={(date) =>
              onChange(date ? date.toISOString().split("T")[0] : "")
            }
            disabled={(date) => {
              if (resolvedMinDate && date < resolvedMinDate) return true;
              if (resolvedMaxDate && date > resolvedMaxDate) return true;
              return false;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }
}
