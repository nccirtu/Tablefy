import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface CheckboxGroupOption {
  label: string;
  value: string | number;
  description?: string;
  disabled?: boolean;
}

interface CheckboxGroupConfig {
  options: CheckboxGroupOption[];
  orientation?: "horizontal" | "vertical";
  columns?: number;
}

export class CheckboxGroup<TData = any> extends BaseField<
  TData,
  (string | number)[]
> {
  private checkboxConfig: CheckboxGroupConfig = {
    options: [],
    orientation: "vertical",
  };

  constructor(name: keyof TData & string) {
    super(name, "checkbox-group");
  }

  static make<TData>(name: keyof TData & string): CheckboxGroup<TData> {
    return new CheckboxGroup<TData>(name);
  }

  options(options: CheckboxGroupOption[]): this {
    this.checkboxConfig.options = options;
    return this;
  }

  horizontal(): this {
    this.checkboxConfig.orientation = "horizontal";
    return this;
  }

  columns(columns: number): this {
    this.checkboxConfig.columns = columns;
    return this;
  }

  protected render(props: FieldRenderProps<TData, (string | number)[]>) {
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

    const selectedValues = value || [];

    const toggleOption = (optionValue: string | number) => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues);
    };

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

        <div
          className={cn(
            "space-y-3",
            this.checkboxConfig.orientation === "horizontal" &&
              "flex flex-wrap gap-4",
            this.checkboxConfig.columns &&
              `grid grid-cols-${this.checkboxConfig.columns} gap-4`,
          )}
        >
          {this.checkboxConfig.options.map((option) => (
            <div
              key={option.value.toString()}
              className="flex items-start space-x-3"
            >
              <Checkbox
                id={`${field.name}-${option.value}`}
                checked={selectedValues.includes(option.value)}
                onCheckedChange={() => toggleOption(option.value)}
                disabled={isDisabled || option.disabled}
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
        </div>

        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
}
