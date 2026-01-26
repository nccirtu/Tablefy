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

interface DatePickerConfig {
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  formatString?: string;
}

export class DatePicker<TData = any> extends BaseField<TData, Date | string> {
  private dateConfig: DatePickerConfig = { formatString: "PPP" };

  constructor(name: keyof TData & string) {
    super(name, "date");
  }

  static make<TData>(name: keyof TData & string): DatePicker<TData> {
    return new DatePicker<TData>(name);
  }

  minDate(date: Date): this {
    this.dateConfig.minDate = date;
    return this;
  }

  maxDate(date: Date): this {
    this.dateConfig.maxDate = date;
    return this;
  }

  disabledDates(dates: Date[]): this {
    this.dateConfig.disabledDates = dates;
    return this;
  }

  format(formatString: string): this {
    this.dateConfig.formatString = formatString;
    return this;
  }

  protected render(props: FieldRenderProps<TData, Date | string>) {
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

    const dateValue = value
      ? typeof value === "string"
        ? new Date(value)
        : value
      : undefined;

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
                !dateValue && "text-muted-foreground",
                error && "border-destructive",
              )}
              disabled={isDisabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? (
                format(dateValue, this.dateConfig.formatString || "PPP")
              ) : (
                <span>{field.placeholder || "Pick a date"}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date) => onChange(date as Date)}
              disabled={(date) => {
                if (this.dateConfig.minDate && date < this.dateConfig.minDate)
                  return true;
                if (this.dateConfig.maxDate && date > this.dateConfig.maxDate)
                  return true;
                if (this.dateConfig.disabledDates) {
                  return this.dateConfig.disabledDates.some(
                    (d) => d.toDateString() === date.toDateString(),
                  );
                }
                return false;
              }}
              initialFocus
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
