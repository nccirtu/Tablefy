import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface MultiSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface MultiSelectConfig {
  options: MultiSelectOption[];
  searchable?: boolean;
  maxItems?: number;
}

export class MultiSelect<TData = any> extends BaseField<
  TData,
  (string | number)[]
> {
  private multiSelectConfig: MultiSelectConfig = {
    options: [],
    searchable: true,
  };

  constructor(name: keyof TData & string) {
    super(name, "multiselect");
  }

  static make<TData>(name: keyof TData & string): MultiSelect<TData> {
    return new MultiSelect<TData>(name);
  }

  options(options: MultiSelectOption[]): this {
    this.multiSelectConfig.options = options;
    return this;
  }

  searchable(searchable: boolean = true): this {
    this.multiSelectConfig.searchable = searchable;
    return this;
  }

  maxItems(max: number): this {
    this.multiSelectConfig.maxItems = max;
    return this;
  }

  protected render(props: FieldRenderProps<TData, (string | number)[]>) {
    const { field, value, error, onChange, data } = props;
    const [open, setOpen] = useState(false);

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
    const selectedOptions = this.multiSelectConfig.options.filter((opt) =>
      selectedValues.includes(opt.value),
    );

    const toggleOption = (optionValue: string | number) => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues);
    };

    const removeOption = (optionValue: string | number) => {
      onChange(selectedValues.filter((v) => v !== optionValue));
    };

    const isMaxReached =
      this.multiSelectConfig.maxItems !== undefined &&
      selectedValues.length >= this.multiSelectConfig.maxItems;

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
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between",
                error && "border-destructive",
              )}
              disabled={isDisabled}
            >
              <span className="truncate">
                {selectedOptions.length > 0
                  ? `${selectedOptions.length} selected`
                  : field.placeholder || "Select options..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              {this.multiSelectConfig.searchable && (
                <CommandInput placeholder="Search..." />
              )}
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {this.multiSelectConfig.options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  const isDisabledOption =
                    option.disabled || (isMaxReached && !isSelected);

                  return (
                    <CommandItem
                      key={option.value.toString()}
                      value={option.value.toString()}
                      onSelect={() =>
                        !isDisabledOption && toggleOption(option.value)
                      }
                      disabled={isDisabledOption}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <Badge key={option.value.toString()} variant="secondary">
                {option.label}
                <button
                  type="button"
                  className="ml-1 rounded-full hover:bg-muted"
                  onClick={() => removeOption(option.value)}
                  disabled={isDisabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
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
