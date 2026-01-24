// lib/table/columns/avatar-group-column.tsx
import AvatarList from "@/components/animata/list/avatar-list";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { BaseColumn } from "./base-column";
import { BaseColumnConfig } from "./types";

interface AvatarItem {
  src?: string;
  name: string;
  fallback?: string;
}

interface AvatarGroupColumnConfig<TData> extends BaseColumnConfig<TData> {
  maxVisible?: number;
  size?: "xs" | "sm" | "md" | "lg";
  overlap?: "none" | "sm" | "md" | "lg";
  showTooltip?: boolean;
  nameField?: keyof TData | ((row: TData) => AvatarItem[]);
  srcField?: string;
  fallbackField?: string;
  showNames?: boolean;
  maxNames?: number;
}

export class AvatarGroupColumn<TData> extends BaseColumn<
  TData,
  AvatarGroupColumnConfig<TData>
> {
  constructor(accessor: keyof TData | string) {
    super(accessor);
    const config = this.config as AvatarGroupColumnConfig<TData>;
    config.maxVisible = 4;
    config.size = "md";
    config.overlap = "md";
    config.showTooltip = true;
    config.showNames = false;
    config.maxNames = 2;
  }

  static make<TData>(accessor: keyof TData | string): AvatarGroupColumn<TData> {
    return new AvatarGroupColumn(accessor);
  }

  // Maximale Anzahl sichtbarer Avatare
  maxVisible(max: number): this {
    (this.config as AvatarGroupColumnConfig<TData>).maxVisible = max;
    return this;
  }

  // Größe der Avatare
  size(size: "xs" | "sm" | "md" | "lg"): this {
    (this.config as AvatarGroupColumnConfig<TData>).size = size;
    return this;
  }

  // Überlappung
  overlap(overlap: "none" | "sm" | "md" | "lg"): this {
    (this.config as AvatarGroupColumnConfig<TData>).overlap = overlap;
    return this;
  }

  // Keine Überlappung
  noOverlap(): this {
    return this.overlap("none");
  }

  // Tooltip deaktivieren
  hideTooltip(): this {
    (this.config as AvatarGroupColumnConfig<TData>).showTooltip = false;
    return this;
  }

  // Felder für Avatar-Daten definieren (wenn Array von Objekten)
  fields(config: { src?: string; name: string; fallback?: string }): this {
    const c = this.config as AvatarGroupColumnConfig<TData>;
    c.srcField = config.src;
    c.nameField = config.name as keyof TData;
    c.fallbackField = config.fallback;
    return this;
  }

  // Custom Mapper für komplexe Datenstrukturen
  mapItems(fn: (row: TData) => AvatarItem[]): this {
    (this.config as AvatarGroupColumnConfig<TData>).nameField = fn;
    return this;
  }

  // Namen neben Avataren anzeigen
  showNames(show = true, max = 2): this {
    const config = this.config as AvatarGroupColumnConfig<TData>;
    config.showNames = show;
    config.maxNames = max;
    return this;
  }

  // Konvertiere AvatarItem zu Datenstruktur für AvatarList
  private toContactItems(
    items: AvatarItem[],
  ): { id: string; src: string; alt: string; initials: string }[] {
    return items.map((item) => ({
      id: item.name,
      src: item.src || "",
      alt: item.name,
      initials: item.fallback || "",
    }));
  }

  build(): ColumnDef<TData, unknown> {
    const config = this.config as AvatarGroupColumnConfig<TData>;
    const {
      accessor,
      label,
      maxVisible,
      size,
      overlap,
      showTooltip,
      nameField,
      srcField,
      fallbackField,
      showNames,
      maxNames,
    } = config;

    const sizeClasses = {
      xs: "h-6 w-6 text-[10px]",
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
    };

    const overlapClasses = {
      none: "",
      sm: "-ml-1",
      md: "-ml-2",
      lg: "-ml-3",
    };

    return {
      accessorKey: accessor as string,
      header: () => (
        <span
          className={cn(
            "text-muted-foreground font-medium",
            this.getAlignmentClass(),
            this.config.headerClassName,
          )}
        >
          {label || String(accessor)}
        </span>
      ),
      cell: ({ getValue, row }) => {
        const rawValue = getValue();

        // Items aus den Daten extrahieren
        let items: AvatarItem[] = [];

        if (typeof nameField === "function") {
          // Custom Mapper
          items = nameField(row.original);
        } else if (Array.isArray(rawValue)) {
          // Array von Objekten oder Strings
          items = rawValue.map((item: unknown) => {
            if (typeof item === "string") {
              return { name: item };
            }
            if (typeof item === "object" && item !== null) {
              const obj = item as Record<string, unknown>;
              return {
                name: String(obj[nameField as string] || obj["name"] || ""),
                src: srcField ? String(obj[srcField] || "") : undefined,
                fallback: fallbackField
                  ? String(obj[fallbackField] || "")
                  : undefined,
              };
            }
            return { name: String(item) };
          });
        }

        if (items.length === 0) {
          return <span className="text-muted-foreground">—</span>;
        }

        // Konvertiere zu Datenstruktur für AvatarList
        const contacts = this.toContactItems(items);

        return (
          <div className={cn("flex items-center", this.config.cellClassName)}>
            <AvatarList
              items={contacts.map((contact) => ({
                id: contact.id,
                src: contact.src,
                alt: contact.alt,
                initials: contact.initials,
              }))}
              size={Number(size || "md")}
              limit={maxVisible || 4}
            />
          </div>
        );
      },
    };
  }
}

