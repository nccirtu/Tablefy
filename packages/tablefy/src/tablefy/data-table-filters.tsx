"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterConfig } from "../types";

interface DataTableFiltersProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (column: string, value: any) => void;
  onReset: () => void;
  label?: string;
}

const ALL = "__all__";

function isActive(value: any): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function DataTableFilters({
  filters,
  values,
  onChange,
  onReset,
  label = "Filter",
}: DataTableFiltersProps) {
  if (!filters || filters.length === 0) return null;

  const activeCount = filters.filter((f) => isActive(values[f.column])).length;

  const renderControl = (filter: FilterConfig) => {
    const value = values[filter.column];

    switch (filter.type) {
      case "select":
        return (
          <Select
            value={value ?? ALL}
            onValueChange={(v: string) =>
              onChange(filter.column, v === ALL ? undefined : v)
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder={filter.placeholder || "Alle"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{filter.placeholder || "Alle"}</SelectItem>
              {(filter.options || []).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multi-select": {
        const selected: string[] = Array.isArray(value) ? value : [];
        const toggle = (v: string, checked: boolean) => {
          const next = checked
            ? [...selected, v]
            : selected.filter((x) => x !== v);
          onChange(filter.column, next.length ? next : undefined);
        };
        return (
          <div className="flex flex-col gap-2">
            {(filter.options || []).map((o) => (
              <label
                key={o.value}
                className="flex items-center gap-2 text-sm font-normal"
              >
                <Checkbox
                  checked={selected.includes(o.value)}
                  onCheckedChange={(c: boolean) => toggle(o.value, !!c)}
                />
                {o.label}
              </label>
            ))}
          </div>
        );
      }

      case "boolean": {
        const current =
          value === true ? "true" : value === false ? "false" : ALL;
        return (
          <Select
            value={current}
            onValueChange={(v: string) =>
              onChange(
                filter.column,
                v === ALL ? undefined : v === "true",
              )
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Alle</SelectItem>
              <SelectItem value="true">{filter.trueLabel || "Ja"}</SelectItem>
              <SelectItem value="false">{filter.falseLabel || "Nein"}</SelectItem>
            </SelectContent>
          </Select>
        );
      }

      case "date":
        return (
          <Input
            type="date"
            value={value ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange(filter.column, e.target.value || undefined)
            }
            className="h-9"
          />
        );

      case "date-range": {
        const range: [string, string] = Array.isArray(value)
          ? [value[0] ?? "", value[1] ?? ""]
          : ["", ""];
        const setPart = (idx: 0 | 1, v: string) => {
          const next: [string, string] = [range[0], range[1]];
          next[idx] = v;
          onChange(
            filter.column,
            next[0] || next[1] ? next : undefined,
          );
        };
        return (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={range[0]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPart(0, e.target.value)
              }
              className="h-9"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="date"
              value={range[1]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPart(1, e.target.value)
              }
              className="h-9"
            />
          </div>
        );
      }

      case "text":
      default:
        return (
          <Input
            value={value ?? ""}
            placeholder={filter.placeholder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange(filter.column, e.target.value || undefined)
            }
            className="h-9"
          />
        );
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="default" className="gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
          {activeCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 min-w-5 justify-center px-1"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Zurücksetzen
            </button>
          )}
        </div>
        <div className={cn("mt-4 flex flex-col gap-4")}>
          {filters.map((filter) => (
            <div key={filter.id} className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                {filter.label}
              </Label>
              {renderControl(filter)}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
