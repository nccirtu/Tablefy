import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { HeaderActionItem } from "./header-actions";

interface HeaderActionGroupProps<TData = unknown> {
  actions: HeaderActionItem<TData>[];
  selectedRows?: TData[];
  label?: string;
  icon?: ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
}

export function HeaderActionGroup<TData = unknown>({
  actions,
  selectedRows = [],
  label = "Aktionen",
  icon,
  variant = "outline",
}: HeaderActionGroupProps<TData>) {
  const visibleActions = actions.filter((action) => !action.hidden);

  if (visibleActions.length === 0) return null;

  // If only one action, render it directly
  if (visibleActions.length === 1) {
    const action = visibleActions[0];
    
    if (action.render) {
      return <>{action.render(selectedRows)}</>;
    }

    return (
      <Button
        variant={action.variant || variant}
        size={action.size || "default"}
        disabled={action.disabled}
        onClick={() => {
          if (action.bulk && action.bulkOnClick) {
            action.bulkOnClick(selectedRows);
          } else if (action.onClick) {
            action.onClick();
          } else if (action.href) {
            window.location.href = action.href;
          }
        }}
      >
        {action.icon && <span className="mr-2">{action.icon}</span>}
        {action.label}
      </Button>
    );
  }

  // Multiple actions - render as dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="default">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {visibleActions.map((action, index) => {
          if (action.render) {
            return <div key={index}>{action.render(selectedRows)}</div>;
          }

          return (
            <DropdownMenuItem
              key={index}
              disabled={action.disabled}
              onClick={() => {
                if (action.bulk && action.bulkOnClick) {
                  action.bulkOnClick(selectedRows);
                } else if (action.onClick) {
                  action.onClick();
                } else if (action.href) {
                  window.location.href = action.href;
                }
              }}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
