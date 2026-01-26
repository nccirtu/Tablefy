import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Slider as SliderUI } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SliderConfig {
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export class Slider<TData = any> extends BaseField<TData, number> {
  private sliderConfig: SliderConfig = {
    min: 0,
    max: 100,
    step: 1,
    showValue: true,
  };

  constructor(name: keyof TData & string) {
    super(name, "slider");
  }

  static make<TData>(name: keyof TData & string): Slider<TData> {
    return new Slider<TData>(name);
  }

  min(min: number): this {
    this.sliderConfig.min = min;
    return this;
  }

  max(max: number): this {
    this.sliderConfig.max = max;
    return this;
  }

  step(step: number): this {
    this.sliderConfig.step = step;
    return this;
  }

  showValue(show: boolean = true): this {
    this.sliderConfig.showValue = show;
    return this;
  }

  formatValue(formatter: (value: number) => string): this {
    this.sliderConfig.formatValue = formatter;
    return this;
  }

  protected render(props: FieldRenderProps<TData, number>) {
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

    const currentValue = value ?? this.sliderConfig.min ?? 0;
    const displayValue = this.sliderConfig.formatValue
      ? this.sliderConfig.formatValue(currentValue)
      : currentValue.toString();

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
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
          {this.sliderConfig.showValue && (
            <span className="text-sm font-medium">{displayValue}</span>
          )}
        </div>
        <SliderUI
          id={field.name}
          value={[currentValue]}
          onValueChange={(values) => onChange(values[0])}
          min={this.sliderConfig.min}
          max={this.sliderConfig.max}
          step={this.sliderConfig.step}
          disabled={isDisabled}
          className={cn(error && "accent-destructive")}
        />
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
}
