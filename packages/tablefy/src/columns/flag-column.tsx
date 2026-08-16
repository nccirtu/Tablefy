import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { BaseColumn } from "./base-column";
import { BaseColumnConfig } from "./types";
import { Icon } from "../lib/icons";
import { writeForRow, type WriteRequest } from "../lib/requests";

interface FlagColumnConfig<TData> extends BaseColumnConfig<TData> {
  markedLabel?: string;
  markedIcon?: string;
  setLabel?: string;
  write?: WriteRequest<TData>;
  hiddenFn?: (row: TData) => boolean;
}

/**
 * The "exactly one row carries this" flag — a default rate, a primary address,
 * a main contact.
 *
 * The marked row shows a marker; every other row shows the action that moves
 * the flag there. Say where to write and the column does it, so the screen
 * never hand-writes a `router.patch`:
 *
 *     FlagColumn.make<Tax>("is_default")
 *       .label("Standard")
 *       .markedLabel("Standard")
 *       .setLabel("Als Standard setzen")
 *       .patch((row) => TaxResource.routes.update(row.id), {
 *         data: () => ({ is_default: true, is_active: true }),
 *       })
 */
export class FlagColumn<TData> extends BaseColumn<
  TData,
  FlagColumnConfig<TData>
> {
  static make<TData>(accessor: keyof TData | string): FlagColumn<TData> {
    return new FlagColumn<TData>(accessor);
  }

  /** Shown on the row that carries the flag. Defaults to the column label. */
  markedLabel(label: string): this {
    this.config.markedLabel = label;
    return this;
  }

  /** Icon name shown next to the marker. */
  markedIcon(name: string): this {
    this.config.markedIcon = name;
    return this;
  }

  /** The action shown on every other row. */
  setLabel(label: string): this {
    this.config.setLabel = label;
    return this;
  }

  /** Where moving the flag writes to. */
  patch(
    url: WriteRequest<TData>["url"],
    options: Omit<WriteRequest<TData>, "url"> = {},
  ): this {
    this.config.write = { url, ...options };
    return this;
  }

  /** Rows that may not take the flag — they show neither marker nor action. */
  hidden(fn: (row: TData) => boolean): this {
    this.config.hiddenFn = fn;
    return this;
  }

  build(): ColumnDef<TData, unknown> {
    const {
      accessor,
      label,
      markedLabel,
      markedIcon = "check-circle",
      setLabel,
      write,
      hiddenFn,
    } = this.config;
    const key = accessor as string;
    const displayLabel = label || key;

    return {
      accessorKey: key,
      meta: { visibilityLabel: displayLabel },
      header: () => (
        <span
          className={cn(
            "text-muted-foreground font-medium",
            this.getHeaderClass(),
            this.config.headerClassName,
          )}
        >
          {displayLabel}
        </span>
      ),
      cell: ({ row }: { row: Row<TData> }) => {
        const record = row.original;

        if (row.getValue(key)) {
          return (
            <span className="inline-flex items-center gap-1 text-success">
              <Icon name={markedIcon} className="size-4" />
              {markedLabel ?? displayLabel}
            </span>
          );
        }

        if (hiddenFn?.(record) || !write || !setLabel) {
          return <span className="text-muted-foreground">—</span>;
        }

        return (
          <Button
            variant="link"
            size="sm"
            className="h-auto px-0"
            onClick={() => writeForRow(write, record, { [key]: true })}
          >
            {setLabel}
          </Button>
        );
      },
      enableSorting: false,
    };
  }
}
