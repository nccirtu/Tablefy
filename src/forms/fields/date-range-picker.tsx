import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangePickerConfig {
  minDate?: Date;
  maxDate?: Date;
  formatString?: string;
}

export class DateRangePicker<TData = any> extends BaseField<TData, DateRange> {
  private dateRangeConfig: DateRangePickerConfig = { formatString: "PPP" };

  constructor(name: keyof TData & string) {
    super(name, "date-range");
  }

  static make<TData>(name: keyof TData & string): DateRangePicker<TData> {
    return new DateRangePicker<TData>(name);
  }

  minDate(date: Date): this {
    this.dateRangeConfig.minDate = date;
    return this;
  }

  maxDate(date: Date): this {
    this.dateRangeConfig.maxDate = date;
    return this;
  }

  format(formatString: string): this {
    this.dateRangeConfig.formatString = formatString;
    return this;
  }

  protected render(props: FieldRenderProps<TData, DateRange>) {
    const { field, value, error, onChange, data } = props;

    const isDisabled =
      typeof field.disabled === "function"
        ? field.disabled(data)
        : field.disabled;
    const isHidden =
      typeof field.hidden === "function" ? field.hidden(data) : field.hidden;
    const helperText =
      typeof field.helperText === "function"
        ? field.helperText(data)
        : field.helperText;

    if (isHidden) {
      return null;
    }

    const dateRange = value || { from: undefined, to: undefined };

    const formatDateRange = () => {
      if (dateRange.from) {
        if (dateRange.to) {
          return `${format(dateRange.from, this.dateRangeConfig.formatString || "PPP")} - ${format(dateRange.to, this.dateRangeConfig.formatString || "PPP")}`;
        }
        return format(
          dateRange.from,
          this.dateRangeConfig.formatString || "PPP",
        );
      }
      return field.placeholder || "Pick a date range";
    };

    return (
      <div className="space-y-2">
        {field.label && (
          <Label
            htmlFor={field.name}
            className={cn(
              field.required &&
                "after:content-['*'] after:ml-0.5 after:text-destructive",
            )}
          >
            {field.label}
          </Label>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={field.name}
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground",
                error && "border-destructive",
              )}
              disabled={isDisabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range: any) =>
                onChange(range || { from: undefined, to: undefined })
              }
              disabled={(date) => {
                if (
                  this.dateRangeConfig.minDate &&
                  date < this.dateRangeConfig.minDate
                )
                  return true;
                if (
                  this.dateRangeConfig.maxDate &&
                  date > this.dateRangeConfig.maxDate
                )
                  return true;
                return false;
              }}
              initialFocus
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
}
