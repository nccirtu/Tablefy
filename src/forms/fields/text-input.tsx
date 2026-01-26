import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TextInputConfig {
  type?: "text" | "email" | "url" | "password";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  autoComplete?: string;
}

export class TextInput<TData = any> extends BaseField<TData, string> {
  private textConfig: TextInputConfig = {};

  constructor(name: keyof TData & string) {
    super(name, "text");
  }

  static make<TData>(name: keyof TData & string): TextInput<TData> {
    return new TextInput<TData>(name);
  }

  email(): this {
    this.textConfig.type = "email";
    this.fieldType = "email";
    return this;
  }

  url(): this {
    this.textConfig.type = "url";
    this.fieldType = "url";
    return this;
  }

  password(): this {
    this.textConfig.type = "password";
    this.fieldType = "password";
    return this;
  }

  minLength(length: number): this {
    this.textConfig.minLength = length;
    return this;
  }

  maxLength(length: number): this {
    this.textConfig.maxLength = length;
    return this;
  }

  pattern(pattern: string): this {
    this.textConfig.pattern = pattern;
    return this;
  }

  autoComplete(value: string): this {
    this.textConfig.autoComplete = value;
    return this;
  }

  protected render(props: FieldRenderProps<TData, string>) {
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
        <Input
          id={field.name}
          name={field.name}
          type={this.textConfig.type || "text"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={field.placeholder}
          disabled={isDisabled}
          readOnly={isReadonly}
          required={field.required}
          minLength={this.textConfig.minLength}
          maxLength={this.textConfig.maxLength}
          pattern={this.textConfig.pattern}
          autoComplete={this.textConfig.autoComplete}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
          )}
        />
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
}
