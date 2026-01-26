import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import {
  Select as SelectUI,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface SelectConfig {
  options: SelectOption[];
  searchable?: boolean;
  clearable?: boolean;
}

export class Select<TData = any> extends BaseField<TData, string | number> {
  private selectConfig: SelectConfig = { options: [] };

  constructor(name: keyof TData & string) {
    super(name, "select");
  }

  static make<TData>(name: keyof TData & string): Select<TData> {
    return new Select<TData>(name);
  }

  options(options: SelectOption[]): this {
    this.selectConfig.options = options;
    return this;
  }

  searchable(): this {
    this.selectConfig.searchable = true;
    return this;
  }

  clearable(): this {
    this.selectConfig.clearable = true;
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
        <SelectUI
          value={value?.toString()}
          onValueChange={(val) => {
            const option = this.selectConfig.options.find(
              (o) => o.value.toString() === val,
            );
            if (option) {
              onChange(option.value);
            }
          }}
          disabled={isDisabled}
        >
          <SelectTrigger
            id={field.name}
            className={cn(error && "border-destructive focus:ring-destructive")}
          >
            <SelectValue
              placeholder={field.placeholder || "Select an option..."}
            />
          </SelectTrigger>
          <SelectContent>
            {this.selectConfig.options.map((option) => (
              <SelectItem
                key={option.value.toString()}
                value={option.value.toString()}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectUI>
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
}
