import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RatingConfig {
  max?: number;
  allowHalf?: boolean;
  showValue?: boolean;
  icon?: "star" | "heart";
}

export class Rating<TData = any> extends BaseField<TData, number> {
  private ratingConfig: RatingConfig = {
    max: 5,
    allowHalf: false,
    showValue: true,
    icon: "star",
  };

  constructor(name: keyof TData & string) {
    super(name, "rating");
  }

  static make<TData>(name: keyof TData & string): Rating<TData> {
    return new Rating<TData>(name);
  }

  max(max: number): this {
    this.ratingConfig.max = max;
    return this;
  }

  allowHalf(): this {
    this.ratingConfig.allowHalf = true;
    return this;
  }

  hideValue(): this {
    this.ratingConfig.showValue = false;
    return this;
  }

  protected render(props: FieldRenderProps<TData, number>) {
    const { field, value, error, onChange, data } = props;
    const [hoverValue, setHoverValue] = useState<number | null>(null);

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

    const currentValue = value || 0;
    const displayValue = hoverValue !== null ? hoverValue : currentValue;
    const maxStars = this.ratingConfig.max || 5;

    const handleClick = (starValue: number) => {
      if (isDisabled) return;
      onChange(starValue === currentValue ? 0 : starValue);
    };

    const handleMouseEnter = (starValue: number) => {
      if (!isDisabled) {
        setHoverValue(starValue);
      }
    };

    const handleMouseLeave = () => {
      setHoverValue(null);
    };

    return (
      <div className="space-y-2">
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

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: maxStars }, (_, i) => {
              const starValue = i + 1;
              const isFilled = starValue <= displayValue;
              const isHalfFilled =
                this.ratingConfig.allowHalf && starValue - 0.5 === displayValue;

              return (
                <button
                  key={i}
                  type="button"
                  className={cn(
                    "transition-all hover:scale-110",
                    isDisabled && "cursor-not-allowed opacity-50",
                  )}
                  onClick={() => handleClick(starValue)}
                  onMouseEnter={() => handleMouseEnter(starValue)}
                  onMouseLeave={handleMouseLeave}
                  disabled={isDisabled}
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      isFilled || isHalfFilled
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground",
                    )}
                  />
                </button>
              );
            })}
          </div>

          {this.ratingConfig.showValue && (
            <span className="text-sm font-medium text-muted-foreground">
              {currentValue > 0 ? `${currentValue}/${maxStars}` : "Not rated"}
            </span>
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
