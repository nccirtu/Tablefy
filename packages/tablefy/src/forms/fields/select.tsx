import React, { ReactNode, useRef, useState } from "react";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BaseField } from "./base-field";
import { SelectConfig, SelectOption } from "../types/field";
import { FieldType, FieldRenderProps } from "../types/form";

/**
 * Searchable combobox (shadcn Command + Popover). The dropdown is portaled into
 * the surrounding Dialog element (if any) — so it is neither clipped by a
 * scrollable dialog body nor blocked by the modal pointer-lock, while staying
 * inside the dialog's focus scope (typing/selection work). Outside a dialog it
 * portals to <body>. Values compare as strings (backend option values are
 * strings while a record's FK is a number).
 */
function SelectCombobox({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  error,
  clearable,
  className,
}: {
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  clearable?: boolean;
  className?: string;
}): ReactNode {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const current = value === null || value === undefined ? "" : String(value);
  const selected = options.find((o) => String(o.value) === current);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setContainer(
        (triggerRef.current?.closest('[role="dialog"]') as HTMLElement | null) ??
          null,
      );
    }
    setOpen(next);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selected && "text-muted-foreground",
            error && "border-destructive",
            className,
          )}
        >
          {selected?.label ?? placeholder ?? "Select..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverPrimitive.Portal container={container ?? undefined}>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className="z-50 w-[var(--radix-popover-trigger-width)] rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none"
        >
          <Command>
          <CommandInput placeholder={placeholder || "Suchen..."} />
          <CommandList>
            <CommandEmpty>Keine Treffer.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const optValue = String(opt.value);
                return (
                  <CommandItem
                    key={optValue}
                    value={`${opt.label} ${optValue}`}
                    disabled={opt.disabled}
                    onSelect={() => {
                      onChange(clearable && optValue === current ? "" : optValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        optValue === current ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </Popover>
  );
}

export class Select<
  TData extends Record<string, any>,
> extends BaseField<TData, SelectConfig<TData>> {
  readonly fieldType: FieldType = "select";

  constructor(name: string) {
    super(name);
    (this.config as SelectConfig<TData>).options = [];
    (this.config as SelectConfig<TData>).multiple = false;
    (this.config as SelectConfig<TData>).searchable = false;
    (this.config as SelectConfig<TData>).clearable = false;
  }

  static make<TData extends Record<string, any>>(
    name: string & keyof TData | string,
  ): Select<TData> {
    return new Select(name);
  }

  options(
    options: SelectOption[] | ((data: TData) => SelectOption[]),
  ): this {
    (this.config as SelectConfig<TData>).options = options;
    return this;
  }

  multiple(multiple = true): this {
    (this.config as SelectConfig<TData>).multiple = multiple;
    return this;
  }

  searchable(searchable = true): this {
    (this.config as SelectConfig<TData>).searchable = searchable;
    return this;
  }

  clearable(clearable = true): this {
    (this.config as SelectConfig<TData>).clearable = clearable;
    return this;
  }

  maxItems(max: number): this {
    (this.config as SelectConfig<TData>).maxItems = max;
    return this;
  }

  loadOptions(fn: (query: string) => Promise<SelectOption[]>): this {
    (this.config as SelectConfig<TData>).loadOptions = fn;
    return this;
  }

  /** Resolve options from a page prop (relationship select), e.g. "companyOptions". */
  optionsFrom(propName: string): this {
    (this.config as SelectConfig<TData>).optionsFrom = propName;
    return this;
  }

  renderField({
    value,
    onChange,
    error,
    disabled,
    data,
    external,
  }: FieldRenderProps<TData>): ReactNode {
    const cfg = this.config as SelectConfig<TData>;
    const resolvedOptions: SelectOption[] = cfg.optionsFrom
      ? ((external?.[cfg.optionsFrom] as SelectOption[]) ?? [])
      : typeof cfg.options === "function"
        ? cfg.options(data)
        : cfg.options;

    // Searchable → shadcn combobox (Command + Popover).
    if (cfg.searchable) {
      return (
        <SelectCombobox
          value={value ?? ""}
          onChange={onChange}
          options={resolvedOptions}
          placeholder={cfg.placeholder}
          disabled={disabled}
          error={!!error}
          clearable={cfg.clearable}
          className={cfg.className}
        />
      );
    }

    return (
      <ShadcnSelect
        value={value ?? ""}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(error && "border-destructive", cfg.className)}
        >
          <SelectValue placeholder={cfg.placeholder || "Select..."} />
        </SelectTrigger>
        <SelectContent>
          {resolvedOptions.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>
    );
  }
}
