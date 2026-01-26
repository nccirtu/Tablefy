import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ColorPickerConfig {
  presetColors?: string[];
  showInput?: boolean;
  format?: "hex" | "rgb" | "hsl";
}

const DEFAULT_PRESET_COLORS = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
];

export class ColorPicker<TData = any> extends BaseField<TData, string> {
  private colorConfig: ColorPickerConfig = {
    presetColors: DEFAULT_PRESET_COLORS,
    showInput: true,
    format: "hex",
  };

  constructor(name: keyof TData & string) {
    super(name, "color");
  }

  static make<TData>(name: keyof TData & string): ColorPicker<TData> {
    return new ColorPicker<TData>(name);
  }

  presetColors(colors: string[]): this {
    this.colorConfig.presetColors = colors;
    return this;
  }

  hideInput(): this {
    this.colorConfig.showInput = false;
    return this;
  }

  format(format: "hex" | "rgb" | "hsl"): this {
    this.colorConfig.format = format;
    return this;
  }

  protected render(props: FieldRenderProps<TData, string>) {
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

    const currentColor = value || "#000000";

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

        <div className="flex gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  error && "border-destructive",
                )}
                disabled={isDisabled}
              >
                <div
                  className="w-6 h-6 rounded border mr-2"
                  style={{ backgroundColor: currentColor }}
                />
                <span className="truncate">{currentColor}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-3">
                <div className="grid grid-cols-6 gap-2">
                  {this.colorConfig.presetColors?.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-8 h-8 rounded border-2 transition-all hover:scale-110",
                        currentColor === color
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent",
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        onChange(color);
                        setOpen(false);
                      }}
                    />
                  ))}
                </div>

                {this.colorConfig.showInput && (
                  <div className="space-y-2">
                    <Label htmlFor={`${field.name}-custom`}>Custom Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`${field.name}-custom`}
                        type="color"
                        value={currentColor}
                        onChange={(e: any) => onChange(e.target.value)}
                        className="h-10 w-14 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={currentColor}
                        onChange={(e: any) => onChange(e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {this.colorConfig.showInput && (
            <Input
              type="text"
              value={currentColor}
              onChange={(e: any) => onChange(e.target.value)}
              placeholder={field.placeholder || "#000000"}
              disabled={isDisabled}
              className={cn("flex-1", error && "border-destructive")}
            />
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
