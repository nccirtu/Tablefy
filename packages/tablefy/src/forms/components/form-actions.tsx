import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormActionConfig } from "../types/actions";

export interface FormActionsProps<TData extends Record<string, any>> {
  actions: FormActionConfig<TData>[];
  position?: "start" | "end" | "between" | "center";
  data: TData;
  processing?: boolean;
}

const positionClass: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  between: "justify-between",
  end: "justify-end",
};

export function FormActions<TData extends Record<string, any>>({
  actions,
  position = "end",
  data,
  processing = false,
}: FormActionsProps<TData>): ReactNode {
  if (!actions.length) return null;

  return (
    <div className={cn("flex gap-2", positionClass[position])}>
      {actions.map((action, i) => {
        const isDisabled =
          typeof action.disabled === "function"
            ? action.disabled(data, processing)
            : action.disabled;

        if (action.type === "submit") {
          return (
            <Button
              key={i}
              type="submit"
              variant={action.variant || "default"}
              disabled={isDisabled || processing}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {processing ? "Processing..." : action.label}
            </Button>
          );
        }

        if (action.type === "cancel" && action.href) {
          return (
            <Button
              key={i}
              type="button"
              variant={action.variant || "outline"}
              disabled={processing}
              asChild
            >
              <a href={action.href}>
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </a>
            </Button>
          );
        }

        return (
          <Button
            key={i}
            type="button"
            variant={action.variant || "outline"}
            onClick={action.onClick}
            disabled={isDisabled || (action.type === "cancel" && processing)}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
