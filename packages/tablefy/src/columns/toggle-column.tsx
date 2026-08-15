import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { BaseColumn } from "./base-column";
import { BaseColumnConfig } from "./types";
import { writeForRow, type WriteRequest } from "../lib/requests";

interface ToggleColumnConfig<TData> extends BaseColumnConfig<TData> {
  onChange?: (row: TData, checked: boolean) => void;
  write?: WriteRequest<TData>;
  disabledFn?: (row: TData) => boolean;
  ariaLabelFn?: (row: TData) => string;
}

/**
 * A boolean shown as a switch the user can flip straight in the row.
 *
 * `BadgeColumn.boolean()` *shows* a yes/no; this one *changes* it. The callback
 * gets the row and the value it should take — persisting is the caller's job,
 * usually a PATCH. Without a handler the switch renders read-only.
 *
 * Say *where* to write and the column does it — the screen never writes a
 * `router.patch` by hand:
 *
 *     ToggleColumn.make<Tax>("is_active")
 *       .label("Aktiv")
 *       .disabled((row) => row.is_default)
 *       .patch((row) => TaxResource.routes.update(row.id))
 *
 * `.onChange()` remains for anything the declarative form does not cover.
 */
export class ToggleColumn<TData> extends BaseColumn<
  TData,
  ToggleColumnConfig<TData>
> {
  static make<TData>(accessor: keyof TData | string): ToggleColumn<TData> {
    return new ToggleColumn<TData>(accessor);
  }

  onChange(handler: (row: TData, checked: boolean) => void): this {
    this.config.onChange = handler;
    return this;
  }

  /**
   * Persist the new value against this URL. The field name is the column's own
   * accessor, so the request body is `{ [accessor]: checked }`.
   */
  patch(
    url: WriteRequest<TData>["url"],
    options: Omit<WriteRequest<TData>, "url"> = {},
  ): this {
    this.config.write = { url, ...options };
    return this;
  }

  /** Rows that may not be flipped — the switch renders, but inert. */
  disabled(fn: (row: TData) => boolean): this {
    this.config.disabledFn = fn;
    return this;
  }

  ariaLabel(fn: (row: TData) => string): this {
    this.config.ariaLabelFn = fn;
    return this;
  }

  build(): ColumnDef<TData, unknown> {
    const { accessor, label, onChange, write, disabledFn, ariaLabelFn } =
      this.config;
    const key = accessor as string;
    const displayLabel = label || key;

    return {
      accessorKey: key,
      meta: { visibilityLabel: displayLabel },
      header: () => (
        <span
          className={cn(
            "text-muted-foreground font-medium",
            this.getAlignmentClass(),
            this.config.headerClassName,
          )}
        >
          {displayLabel}
        </span>
      ),
      cell: ({ row }: { row: Row<TData> }) => {
        const record = row.original;

        return (
          <Switch
            checked={Boolean(row.getValue(key))}
            disabled={disabledFn?.(record) ?? !(onChange || write)}
            aria-label={ariaLabelFn?.(record) ?? displayLabel}
            onCheckedChange={(checked: boolean) => {
              if (write) writeForRow(write, record, { [key]: checked });
              onChange?.(record, checked);
            }}
          />
        );
      },
      enableSorting: false,
    };
  }
}
