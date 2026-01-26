import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberInputConfig {
  min?: number;
  max?: number;
  step?: number;
  showControls?: boolean;
  prefix?: string;
  suffix?: string;
}

export class NumberInput<TData = any> extends BaseField<TData, number> {
  private numberConfig: NumberInputConfig = { step: 1, showControls: false };

  constructor(name: keyof TData & string) {
    super(name, "number");
  }

  static make<TData>(name: keyof TData & string): NumberInput<TData> {
    return new NumberInput<TData>(name);
  }

  min(min: number): this {
    this.numberConfig.min = min;
    return this;
  }

  max(max: number): this {
    this.numberConfig.max = max;
    return this;
  }

  step(step: number): this {
    this.numberConfig.step = step;
    return this;
  }

  showControls(): this {
    this.numberConfig.showControls = true;
    return this;
  }

  prefix(prefix: string): this {
    this.numberConfig.prefix = prefix;
    return this;
  }

  suffix(suffix: string): this {
    this.numberConfig.suffix = suffix;
    return this;
  }

  protected render(props: FieldRenderProps<TData, number>) {
    const { field, value, error, onChange, onBlur, data } = props;

    const isDisabled =
      typeof field.disabled === "function"
        ? field.disabled(data)
        : field.disabled;
    const isReadonly =
      typeof field.readonly === "function"
        ? field.readonly(data)
        : field.readonly;
    const isHidden =
      typeof field.hidden === "function" ? field.hidden(data) : field.hidden;
    const helperText =
      typeof field.helperText === "function"
        ? field.helperText(data)
        : field.helperText;

    if (isHidden) {
      return null;
    }

    const handleIncrement = () => {
      const currentValue = value || 0;
      const newValue = currentValue + (this.numberConfig.step || 1);
      if (
        this.numberConfig.max === undefined ||
        newValue <= this.numberConfig.max
      ) {
        onChange(newValue);
      }
    };

    const handleDecrement = () => {
      const currentValue = value || 0;
      const newValue = currentValue - (this.numberConfig.step || 1);
      if (
        this.numberConfig.min === undefined ||
        newValue >= this.numberConfig.min
      ) {
        onChange(newValue);
      }
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
        <div className="flex items-center gap-2">
          {this.numberConfig.showControls && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={
                isDisabled ||
                (this.numberConfig.min !== undefined &&
                  (value || 0) <= this.numberConfig.min)
              }
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
          <div className="relative flex-1">
            {this.numberConfig.prefix && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {this.numberConfig.prefix}
              </span>
            )}
            <Input
              id={field.name}
              name={field.name}
              type="number"
              value={value ?? ""}
              onChange={(e: any) => {
                const val =
                  e.target.value === "" ? undefined : Number(e.target.value);
                onChange(val);
              }}
              onBlur={onBlur}
              placeholder={field.placeholder}
              disabled={isDisabled}
              readOnly={isReadonly}
              required={field.required}
              min={this.numberConfig.min}
              max={this.numberConfig.max}
              step={this.numberConfig.step}
              className={cn(
                error && "border-destructive focus-visible:ring-destructive",
                this.numberConfig.prefix && "pl-8",
                this.numberConfig.suffix && "pr-8",
              )}
            />
            {this.numberConfig.suffix && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {this.numberConfig.suffix}
              </span>
            )}
          </div>
          {this.numberConfig.showControls && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={
                isDisabled ||
                (this.numberConfig.max !== undefined &&
                  (value || 0) >= this.numberConfig.max)
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
}
