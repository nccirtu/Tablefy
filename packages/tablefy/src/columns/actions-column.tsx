import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { writeForRow } from "../lib/requests";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { ReactNode } from "react";
import type { ConfirmOptions, FormSchemaInput } from "../dialog/types";
import {
  ActionDialogConfig,
  ActionFormConfig,
  ActionItem,
  DropdownActions,
  InlineActions,
} from "./row-actions";

// Re-exported for back-compat (the canonical definitions live in row-actions).
export type { ActionItem, ActionFormConfig, ActionDialogConfig };

interface ActionsColumnConfig<TData> {
  actions: ActionItem<TData>[];
  label?: string;
  triggerIcon?: ReactNode;
  /** "dropdown" (default) or "inline" icon buttons. */
  variant?: "dropdown" | "inline";
}

export class ActionsColumn<TData> {
  private config: ActionsColumnConfig<TData> = {
    actions: [],
    label: "Aktionen",
  };

  static make<TData>(): ActionsColumn<TData> {
    return new ActionsColumn();
  }

  label(label: string): this {
    this.config.label = label;
    return this;
  }

  triggerIcon(icon: ReactNode): this {
    this.config.triggerIcon = icon;
    return this;
  }

  /**
   * Show the actions as icon buttons in the cell instead of behind a
   * three-dots trigger. Same actions, same behaviour.
   */
  inline(enabled = true): this {
    this.config.variant = enabled ? "inline" : "dropdown";
    return this;
  }

  // Action hinzufügen
  action(action: ActionItem<TData>): this {
    this.config.actions.push(action);
    return this;
  }

  // Shortcuts für gängige Actions
  view(onClick: (row: TData) => void): this {
    return this.action({ label: "Anzeigen", onClick });
  }

  edit(onClick: (row: TData) => void): this {
    return this.action({ label: "Bearbeiten", onClick });
  }

  /**
   * Delete shortcut. Takes either the URL to send to — the column issues the
   * request itself — or a callback for anything unusual.
   *
   *     .delete((row) => TaxResource.routes.destroy(row.id))
   */
  delete(
    target: string | ((row: TData) => string) | ((row: TData) => void),
    options?: {
      confirm?: boolean | ConfirmOptions;
      /** Hide the entry for rows that may not be deleted. */
      hidden?: (row: TData) => boolean;
      disabled?: (row: TData) => boolean;
    },
  ): this {
    // A function returning a string is a URL; one returning nothing does the
    // work itself. Decided per row, since only the call can tell them apart.
    const onClick = (row: TData) => {
      const result =
        typeof target === "function"
          ? (target as (row: TData) => string | void)(row)
          : target;

      if (typeof result === "string") {
        writeForRow({ url: result, method: "delete" }, row);
      }
    };

    return this.action({
      label: "Löschen",
      icon: "trash",
      onClick,
      variant: "destructive",
      separator: true,
      hidden: options?.hidden,
      disabled: options?.disabled,
      // Confirm by default; opt out with .delete(fn, { confirm: false }).
      confirm:
        options?.confirm ?? {
          title: "Eintrag löschen?",
          description: "Diese Aktion kann nicht rückgängig gemacht werden.",
          confirmLabel: "Löschen",
          variant: "destructive",
        },
    });
  }

  /** Edit via a modal form (prefilled from the row by default). */
  editForm(
    schema: FormSchemaInput,
    url: string | ((row: TData) => string),
    options?: Partial<ActionFormConfig<TData>>,
  ): this {
    return this.action({
      label: "Bearbeiten",
      form: {
        schema,
        method: "put",
        url,
        data: (row) => row as Record<string, unknown>,
        ...options,
      },
    });
  }

  /** Open a custom-content dialog from a row action. */
  dialog(
    config: { label: string; icon?: ReactNode } & ActionDialogConfig<TData>,
  ): this {
    return this.action({
      label: config.label,
      icon: config.icon,
      dialog: {
        title: config.title,
        description: config.description,
        content: config.content,
      },
    });
  }

  link(label: string, href: (row: TData) => string): this {
    return this.action({ label, href });
  }

  separator(): this {
    if (this.config.actions.length > 0) {
      this.config.actions[this.config.actions.length - 1].separator = true;
    }
    return this;
  }

  /** The collected actions (for reuse outside the table, e.g. a Kanban card). */
  getActions(): ActionItem<TData>[] {
    return this.config.actions;
  }

  getTriggerIcon(): ReactNode {
    return this.config.triggerIcon;
  }

  build(): ColumnDef<TData, unknown> {
    const { actions, label, triggerIcon, variant } = this.config;

    return {
      id: "actions",
      header: () => <span className="sr-only">{label}</span>,
      cell: ({ row }) =>
        variant === "inline" ? (
          <InlineActions record={row.original} actions={actions} />
        ) : (
          <DropdownActions
            record={row.original}
            actions={actions}
            label={label}
            triggerIcon={triggerIcon}
          />
        ),
      enableSorting: false,
      enableHiding: false,
      meta: { align: "right" },
    };
  }
}
