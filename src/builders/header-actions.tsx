import { ReactNode } from "react";
import { HeaderAction } from "../types/actions";

export interface HeaderActionItem<TData = unknown> {
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  render?: (selectedRows?: TData[]) => ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  hidden?: boolean;
  bulk?: boolean;
  bulkOnClick?: (selectedRows: TData[]) => void;
}

interface HeaderActionsConfig<TData> {
  actions: HeaderActionItem<TData>[];
}

export class HeaderActions<TData = unknown> {
  private config: HeaderActionsConfig<TData> = {
    actions: [],
  };

  static make<TData>(): HeaderActions<TData> {
    return new HeaderActions();
  }

  label(label: string): this {
    if (this.config.actions.length > 0) {
      this.config.actions[this.config.actions.length - 1].label = label;
    }
    return this;
  }

  icon(icon: ReactNode): this {
    if (this.config.actions.length > 0) {
      this.config.actions[this.config.actions.length - 1].icon = icon;
    }
    return this;
  }

  variant(
    variant: "default" | "secondary" | "outline" | "ghost" | "destructive",
  ): this {
    if (this.config.actions.length > 0) {
      this.config.actions[this.config.actions.length - 1].variant = variant;
    }
    return this;
  }

  size(size: "default" | "sm" | "lg" | "icon"): this {
    if (this.config.actions.length > 0) {
      this.config.actions[this.config.actions.length - 1].size = size;
    }
    return this;
  }

  disabled(disabled: boolean = true): this {
    if (this.config.actions.length > 0) {
      this.config.actions[this.config.actions.length - 1].disabled = disabled;
    }
    return this;
  }

  loading(loading: boolean = true): this {
    if (this.config.actions.length > 0) {
      this.config.actions[this.config.actions.length - 1].loading = loading;
    }
    return this;
  }

  hidden(hidden: boolean = true): this {
    if (this.config.actions.length > 0) {
      this.config.actions[this.config.actions.length - 1].hidden = hidden;
    }
    return this;
  }

  action(action: HeaderActionItem<TData>): this {
    this.config.actions.push(action);
    return this;
  }

  onClick(handler: () => void): this {
    if (this.config.actions.length > 0) {
      this.config.actions[this.config.actions.length - 1].onClick = handler;
    }
    return this;
  }

  href(url: string): this {
    if (this.config.actions.length > 0) {
      this.config.actions[this.config.actions.length - 1].href = url;
    }
    return this;
  }

  bulk(handler: (selectedRows: TData[]) => void): this {
    if (this.config.actions.length > 0) {
      this.config.actions[this.config.actions.length - 1].bulk = true;
      this.config.actions[this.config.actions.length - 1].bulkOnClick = handler;
    }
    return this;
  }

  create(config: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
  }): this {
    return this.action({
      label: config.label,
      href: config.href,
      onClick: config.onClick,
      icon: config.icon,
      variant: "default",
    });
  }

  export(config: { label: string; icon?: ReactNode; onClick?: () => void }): this {
    return this.action({
      label: config.label,
      icon: config.icon,
      onClick: config.onClick,
      variant: "outline",
    });
  }

  import(config: {
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
  }): this {
    return this.action({
      label: config.label,
      icon: config.icon,
      onClick: config.onClick,
      variant: "outline",
    });
  }

  bulkExport(config: {
    label: string;
    icon?: ReactNode;
    onExport: (rows: TData[]) => void;
  }): this {
    return this.action({
      label: config.label,
      icon: config.icon,
      bulk: true,
      bulkOnClick: config.onExport,
      variant: "outline",
    });
  }

  bulkDelete(config: {
    label: string;
    icon?: ReactNode;
    onDelete: (rows: TData[]) => void;
  }): this {
    return this.action({
      label: config.label,
      icon: config.icon,
      bulk: true,
      bulkOnClick: config.onDelete,
      variant: "destructive",
    });
  }

  build(): HeaderActionItem<TData>[] {
    return this.config.actions;
  }

  buildLegacy(): HeaderAction<TData>[] {
    return this.config.actions.map((action, index) => ({
      id: `action-${index}`,
      label: action.label || "",
      icon: action.icon,
      onClick: action.onClick,
      href: action.href,
      variant: action.variant,
      size: action.size,
      disabled: action.disabled,
      loading: action.loading,
      hidden: action.hidden,
      bulk: action.bulk,
      bulkOnClick: action.bulkOnClick,
    }));
  }
}
