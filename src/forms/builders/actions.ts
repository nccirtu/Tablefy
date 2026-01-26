import { ReactNode } from "react";
import { FormAction } from "../types/form";

export class ActionsBuilder {
  private actions: FormAction[] = [];

  submit(config?: {
    label?: string;
    loading?: boolean;
    disabled?: boolean;
    icon?: ReactNode;
  }): this {
    this.actions.push({
      type: "submit",
      label: config?.label || "Submit",
      loading: config?.loading,
      disabled: config?.disabled,
      icon: config?.icon,
    });
    return this;
  }

  cancel(config?: {
    label?: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
  }): this {
    this.actions.push({
      type: "cancel",
      label: config?.label || "Cancel",
      variant: "outline",
      href: config?.href,
      onClick: config?.onClick,
      icon: config?.icon,
    });
    return this;
  }

  custom(config: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    icon?: ReactNode;
    loading?: boolean;
    disabled?: boolean;
  }): this {
    this.actions.push({
      type: "custom",
      ...config,
    });
    return this;
  }

  build(): FormAction[] {
    return this.actions;
  }
}
