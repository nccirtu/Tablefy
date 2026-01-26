import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export class Toggle<TData = any> extends BaseField<TData, boolean> {
  constructor(name: keyof TData & string) {
    super(name, "toggle");
  }

  static make<TData>(name: keyof TData & string): Toggle<TData> {
    return new Toggle<TData>(name);
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
        <div className="flex items-center justify-between space-x-4">
          <div className="space-y-0.5">
            {field.label && (
              <Label
                htmlFor={field.name}
                className={cn(
                  "text-base",
                  field.required &&
                    "after:content-['*'] after:ml-0.5 after:text-destructive",
                )}
              >
                {field.label}
              </Label>
            )}
            {helperText && !error && (
              <p className="text-sm text-muted-foreground">{helperText}</p>
            )}
          </div>
          <Switch
            id={field.name}
            checked={value || false}
            onCheckedChange={onChange}
            disabled={isDisabled}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
}
