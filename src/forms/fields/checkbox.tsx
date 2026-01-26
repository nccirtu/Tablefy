import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Checkbox as CheckboxUI } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export class Checkbox<TData = any> extends BaseField<TData, boolean> {
  constructor(name: keyof TData & string) {
    super(name, "checkbox");
  }

  static make<TData>(name: keyof TData & string): Checkbox<TData> {
    return new Checkbox<TData>(name);
  }

  protected render(props: FieldRenderProps<TData, boolean>) {
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
        <div className="flex items-start space-x-3">
          <CheckboxUI
            id={field.name}
            checked={value || false}
            onCheckedChange={(checked) => onChange(checked as boolean)}
            disabled={isDisabled}
            className={cn(error && "border-destructive")}
          />
          {field.label && (
            <div className="space-y-1 leading-none">
              <Label
                htmlFor={field.name}
                className={cn(
                  "cursor-pointer",
                  field.required &&
                    "after:content-['*'] after:ml-0.5 after:text-destructive",
                )}
              >
                {field.label}
              </Label>
              {helperText && !error && (
                <p className="text-sm text-muted-foreground">{helperText}</p>
              )}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
}
