import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import {
  RadioGroup as RadioGroupUI,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface RadioOption {
  label: string;
  value: string | number;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupConfig {
  options: RadioOption[];
  orientation?: "horizontal" | "vertical";
}

export class RadioGroup<TData = any> extends BaseField<TData, string | number> {
  private radioConfig: RadioGroupConfig = {
    options: [],
    orientation: "vertical",
  };

  constructor(name: keyof TData & string) {
    super(name, "radio");
  }

  static make<TData>(name: keyof TData & string): RadioGroup<TData> {
    return new RadioGroup<TData>(name);
  }

  options(options: RadioOption[]): this {
    this.radioConfig.options = options;
    return this;
  }

  horizontal(): this {
    this.radioConfig.orientation = "horizontal";
    return this;
  }

  protected render(props: FieldRenderProps<TData, string | number>) {
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

    return (
      <div className="space-y-3">
        {field.label && (
          <Label
            className={cn(
              field.required &&
                "after:content-['*'] after:ml-0.5 after:text-destructive",
            )}
          >
            {field.label}
          </Label>
        )}
        <RadioGroupUI
          value={value?.toString()}
          onValueChange={(val) => {
            const option = this.radioConfig.options.find(
              (o) => o.value.toString() === val,
            );
            if (option) {
              onChange(option.value);
            }
          }}
          disabled={isDisabled}
          className={cn(
            this.radioConfig.orientation === "horizontal" &&
              "flex flex-row space-x-4",
          )}
        >
          {this.radioConfig.options.map((option) => (
            <div
              key={option.value.toString()}
              className="flex items-start space-x-3"
            >
              <RadioGroupItem
                value={option.value.toString()}
                id={`${field.name}-${option.value}`}
                disabled={option.disabled}
                className={cn(error && "border-destructive")}
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor={`${field.name}-${option.value}`}
                  className="cursor-pointer font-normal"
                >
                  {option.label}
                </Label>
                {option.description && (
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </RadioGroupUI>
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
}
