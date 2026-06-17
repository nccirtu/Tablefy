import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { ReactNode } from "react";
import { dialog } from "../dialog/dialog";
import type { ConfirmOptions, FormSchemaInput } from "../dialog/types";

/** Open a schema form in a modal from a row action (url/data may use the row). */
export interface ActionFormConfig<TData> {
  title?: string;
  description?: string;
  schema: FormSchemaInput;
  method?: "post" | "put" | "patch";
  url: string | ((row: TData) => string);
  data?: Record<string, unknown> | ((row: TData) => Record<string, unknown>);
  submitLabel?: string;
  onSuccess?: () => void;
}

/** Open arbitrary content in a modal from a row action. */
export interface ActionDialogConfig<TData> {
  title?: string;
  description?: string;
  content: (row: TData) => ReactNode;
}

export interface ActionItem<TData> {
  label?: string; // optional when render is used
  icon?: ReactNode;
  onClick?: (row: TData) => void;
  href?: (row: TData) => string;
  render?: (row: TData) => ReactNode; // custom renderer for complex UI
  variant?: "default" | "destructive";
  separator?: boolean;
  hidden?: (row: TData) => boolean;
  disabled?: (row: TData) => boolean;
  /** Confirm before running onClick/href (true = default copy, or custom). */
  confirm?: boolean | ConfirmOptions;
  /** Open a form dialog instead of onClick/href. */
  form?: ActionFormConfig<TData>;
  /** Open a custom-content dialog instead of onClick/href. */
  dialog?: ActionDialogConfig<TData>;
}

/** Resolve a row action: form/custom dialog, optional confirm, then onClick/href. */
function runAction<TData>(action: ActionItem<TData>, row: TData): void {
  if (action.form) {
    const f = action.form;
    dialog.form({
      title: f.title,
      description: f.description,
      schema: f.schema,
      method: f.method,
      url: typeof f.url === "function" ? f.url(row) : f.url,
      data: typeof f.data === "function" ? f.data(row) : f.data,
      submitLabel: f.submitLabel,
      onSuccess: f.onSuccess,
    });
    return;
  }

  if (action.dialog) {
    dialog.open({
      title: action.dialog.title,
      description: action.dialog.description,
      content: action.dialog.content(row),
    });
    return;
  }

  const exec = () => {
    if (action.href) window.location.href = action.href(row);
    else action.onClick?.(row);
  };

  if (action.confirm) {
    const opts = action.confirm === true ? {} : action.confirm;
    void dialog
      .confirm({
        variant: action.variant === "destructive" ? "destructive" : "default",
        ...opts,
      })
      .then((ok) => {
        if (ok) exec();
      });
  } else {
    exec();
  }
}

interface ActionsColumnConfig<TData> {
  actions: ActionItem<TData>[];
  label?: string;
  triggerIcon?: ReactNode;
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

  delete(
    onClick: (row: TData) => void,
    options?: { confirm?: boolean | ConfirmOptions },
  ): this {
    return this.action({
      label: "Löschen",
      onClick,
      variant: "destructive",
      separator: true,
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

  build(): ColumnDef<TData, unknown> {
    const { actions, label, triggerIcon } = this.config;

    return {
      id: "actions",
      header: () => <span className="sr-only">{label}</span>,
      cell: ({ row }) => {
        const data = row.original;

        const visibleActions = actions.filter(
          (action) => !action.hidden || !action.hidden(data),
        );

        if (visibleActions.length === 0) return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 p-0">
                <span className="sr-only">{label}</span>
                {triggerIcon || <MoreHorizontal className="h-8 w-8" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {visibleActions.map((action, index) => (
                <div key={index}>
                  {action.render ? (
                    // Custom render function takes priority
                    action.render(data)
                  ) : (
                    // Standard menu item
                    <DropdownMenuItem
                      disabled={action.disabled?.(data)}
                      className={cn(
                        action.variant === "destructive" &&
                          "text-destructive focus:text-destructive",
                      )}
                      onClick={() => runAction(action, data)}
                    >
                      {action.icon && (
                        <span className="mr-2">{action.icon}</span>
                      )}
                      {action.label}
                    </DropdownMenuItem>
                  )}
                  {action.separator && index < visibleActions.length - 1 && (
                    <DropdownMenuSeparator />
                  )}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    };
  }
}
