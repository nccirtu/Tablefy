import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Textarea as TextareaUI } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TextareaConfig {
  rows?: number;
  minLength?: number;
  maxLength?: number;
  resize?: boolean;
}

export class Textarea<TData = any> extends BaseField<TData, string> {
  private textareaConfig: TextareaConfig = { rows: 3, resize: true };

  constructor(name: keyof TData & string) {
    super(name, "textarea");
  }

  static make<TData>(name: keyof TData & string): Textarea<TData> {
    return new Textarea<TData>(name);
  }

  rows(rows: number): this {
    this.textareaConfig.rows = rows;
    return this;
  }

  minLength(length: number): this {
    this.textareaConfig.minLength = length;
    return this;
  }

  maxLength(length: number): this {
    this.textareaConfig.maxLength = length;
    return this;
  }

  noResize(): this {
    this.textareaConfig.resize = false;
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

    const currentLength = value?.length || 0;
    const showCounter = this.textareaConfig.maxLength !== undefined;

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
        <TextareaUI
          id={field.name}
          name={field.name}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={field.placeholder}
          disabled={isDisabled}
          readOnly={isReadonly}
          required={field.required}
          rows={this.textareaConfig.rows}
          minLength={this.textareaConfig.minLength}
          maxLength={this.textareaConfig.maxLength}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            !this.textareaConfig.resize && "resize-none",
          )}
        />
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {helperText && !error && (
              <p className="text-sm text-muted-foreground">{helperText}</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          {showCounter && (
            <p className="text-sm text-muted-foreground">
              {currentLength}/{this.textareaConfig.maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
}
