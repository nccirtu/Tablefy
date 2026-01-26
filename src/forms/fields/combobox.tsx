import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface ComboboxOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface ComboboxConfig {
  options: ComboboxOption[];
  searchPlaceholder?: string;
  emptyText?: string;
  allowCustom?: boolean;
}

export class Combobox<TData = any> extends BaseField<TData, string | number> {
  private comboboxConfig: ComboboxConfig = {
    options: [],
    searchPlaceholder: "Search...",
    emptyText: "No results found.",
    allowCustom: false,
  };

  constructor(name: keyof TData & string) {
    super(name, "text");
  }

  static make<TData>(name: keyof TData & string): Combobox<TData> {
    return new Combobox<TData>(name);
  }

  options(options: ComboboxOption[]): this {
    this.comboboxConfig.options = options;
    return this;
  }

  searchPlaceholder(placeholder: string): this {
    this.comboboxConfig.searchPlaceholder = placeholder;
    return this;
  }

  emptyText(text: string): this {
    this.comboboxConfig.emptyText = text;
    return this;
  }

  allowCustom(): this {
    this.comboboxConfig.allowCustom = true;
    return this;
  }

  protected render(props: FieldRenderProps<TData, string | number>) {
    const { field, value, error, onChange, data } = props;
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

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

    const selectedOption = this.comboboxConfig.options.find(
      (opt) => opt.value === value,
    );

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
                !value && "text-muted-foreground",
                error && "border-destructive",
              )}
              disabled={isDisabled}
            >
              <span className="truncate">
                {selectedOption
                  ? selectedOption.label
                  : field.placeholder || "Select option..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder={this.comboboxConfig.searchPlaceholder}
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandEmpty>
                {this.comboboxConfig.emptyText}
                {this.comboboxConfig.allowCustom && searchValue && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start mt-2"
                    onClick={() => {
                      onChange(searchValue);
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    Create "{searchValue}"
                  </Button>
                )}
              </CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {this.comboboxConfig.options.map((option) => (
                  <CommandItem
                    key={option.value.toString()}
                    value={option.value.toString()}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    disabled={option.disabled}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
}
