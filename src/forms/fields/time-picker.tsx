import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TimePickerConfig {
  format?: "12h" | "24h";
  step?: number; // minutes
}

export class TimePicker<TData = any> extends BaseField<TData, string> {
  private timeConfig: TimePickerConfig = {
    format: "24h",
    step: 15,
  };

  constructor(name: keyof TData & string) {
    super(name, "time");
  }

  static make<TData>(name: keyof TData & string): TimePicker<TData> {
    return new TimePicker<TData>(name);
  }

  format12h(): this {
    this.timeConfig.format = "12h";
    return this;
  }

  step(minutes: number): this {
    this.timeConfig.step = minutes;
    return this;
  }

  protected render(props: FieldRenderProps<TData, string>) {
    const { field, value, error, onChange, data } = props;
    const [open, setOpen] = useState(false);

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

    const generateTimeSlots = () => {
      const slots: string[] = [];
      const totalMinutes = 24 * 60;
      const step = this.timeConfig.step || 15;

      for (let i = 0; i < totalMinutes; i += step) {
        const hours = Math.floor(i / 60);
        const minutes = i % 60;

        if (this.timeConfig.format === "12h") {
          const period = hours >= 12 ? "PM" : "AM";
          const displayHours =
            hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
          slots.push(
            `${displayHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`,
          );
        } else {
          slots.push(
            `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
          );
        }
      }

      return slots;
    };

    const timeSlots = generateTimeSlots();

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

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={field.name}
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                error && "border-destructive",
              )}
              disabled={isDisabled}
            >
              <Clock className="mr-2 h-4 w-4" />
              {value || field.placeholder || "Select time"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <div className="max-h-64 overflow-auto p-1">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded hover:bg-accent",
                    value === slot && "bg-accent font-medium",
                  )}
                  onClick={() => {
                    onChange(slot);
                    setOpen(false);
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
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
