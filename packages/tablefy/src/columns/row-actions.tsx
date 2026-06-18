import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
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
export function runAction<TData>(action: ActionItem<TData>, row: TData): void {
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

export interface DropdownActionsProps<TData> {
  record: TData;
  actions: ActionItem<TData>[];
  label?: string;
  triggerIcon?: ReactNode;
  align?: "start" | "end" | "center";
  /** Extra classes for the trigger button. */
  triggerClassName?: string;
}

/**
 * Renders a list of row actions as a three-dots dropdown menu. Shared by the
 * table's ActionsColumn and the Kanban card.
 */
export function DropdownActions<TData>({
  record,
  actions,
  label = "Aktionen",
  triggerIcon,
  align = "end",
  triggerClassName,
}: DropdownActionsProps<TData>): ReactNode {
  const visible = actions.filter((a) => !a.hidden || !a.hidden(record));
  if (visible.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("h-7 w-7 p-0", triggerClassName)}
        >
          <span className="sr-only">{label}</span>
          {triggerIcon || <MoreHorizontal className="size-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {visible.map((action, index) => (
          <div key={index}>
            {action.render ? (
              action.render(record)
            ) : (
              <DropdownMenuItem
                disabled={action.disabled?.(record)}
                className={cn(
                  action.variant === "destructive" &&
                    "text-destructive focus:text-destructive",
                )}
                onClick={() => runAction(action, record)}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </DropdownMenuItem>
            )}
            {action.separator && index < visible.length - 1 && (
              <DropdownMenuSeparator />
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
