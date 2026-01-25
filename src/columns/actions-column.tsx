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

  delete(onClick: (row: TData) => void): this {
    return this.action({
      label: "Löschen",
      onClick,
      variant: "destructive",
      separator: true,
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
                      onClick={() => {
                        if (action.href) {
                          window.location.href = action.href(data);
                        } else if (action.onClick) {
                          action.onClick(data);
                        }
                      }}
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
