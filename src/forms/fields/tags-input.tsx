import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, KeyboardEvent } from "react";

interface TagsInputConfig {
  maxTags?: number;
  allowDuplicates?: boolean;
  separator?: string;
  suggestions?: string[];
}

export class TagsInput<TData = any> extends BaseField<TData, string[]> {
  private tagsConfig: TagsInputConfig = {
    allowDuplicates: false,
    separator: ",",
  };

  constructor(name: keyof TData & string) {
    super(name, "text");
  }

  static make<TData>(name: keyof TData & string): TagsInput<TData> {
    return new TagsInput<TData>(name);
  }

  maxTags(max: number): this {
    this.tagsConfig.maxTags = max;
    return this;
  }

  allowDuplicates(): this {
    this.tagsConfig.allowDuplicates = true;
    return this;
  }

  separator(separator: string): this {
    this.tagsConfig.separator = separator;
    return this;
  }

  suggestions(suggestions: string[]): this {
    this.tagsConfig.suggestions = suggestions;
    return this;
  }

  protected render(props: FieldRenderProps<TData, string[]>) {
    const { field, value, error, onChange, data } = props;
    const [inputValue, setInputValue] = useState("");

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

    const tags = value || [];

    const addTag = (tag: string) => {
      const trimmedTag = tag.trim();
      if (!trimmedTag) return;

      // Check duplicates
      if (!this.tagsConfig.allowDuplicates && tags.includes(trimmedTag)) {
        return;
      }

      // Check max tags
      if (this.tagsConfig.maxTags && tags.length >= this.tagsConfig.maxTags) {
        return;
      }

      onChange([...tags, trimmedTag]);
      setInputValue("");
    };

    const removeTag = (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === this.tagsConfig.separator) {
        e.preventDefault();
        addTag(inputValue);
      } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        removeTag(tags.length - 1);
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const newTags = pastedText
        .split(this.tagsConfig.separator || ",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      newTags.forEach((tag) => addTag(tag));
    };

    const isMaxReached =
      this.tagsConfig.maxTags !== undefined &&
      tags.length >= this.tagsConfig.maxTags;

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

        <div
          className={cn(
            "flex flex-wrap gap-2 p-3 border rounded-md min-h-[42px]",
            error && "border-destructive",
            isDisabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => !isDisabled && removeTag(index)}
                disabled={isDisabled}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {!isMaxReached && (
            <Input
              type="text"
              value={inputValue}
              onChange={(e: any) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={() => inputValue && addTag(inputValue)}
              placeholder={
                tags.length === 0
                  ? field.placeholder || "Type and press Enter..."
                  : ""
              }
              disabled={isDisabled}
              className="flex-1 min-w-[120px] border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          )}
        </div>

        {this.tagsConfig.suggestions &&
          this.tagsConfig.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">
                Suggestions:
              </span>
              {this.tagsConfig.suggestions
                .filter((suggestion) => !tags.includes(suggestion))
                .slice(0, 5)
                .map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addTag(suggestion)}
                    disabled={isDisabled || isMaxReached}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    {suggestion}
                  </button>
                ))}
            </div>
          )}

        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
}
