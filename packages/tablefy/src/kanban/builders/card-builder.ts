import { ReactNode } from "react";
import {
  KanbanCardBadge,
  KanbanCardConfig,
  KanbanCardMeta,
} from "../types";

type Accessor<T> = (keyof T & string) | string;
type ValueFn<T> = (record: T) => ReactNode;

/**
 * Describes how one card renders. Field references resolve against the record
 * (dot-notation supported, e.g. `"company.name"`).
 */
export class CardBuilder<T extends Record<string, any>> {
  private cfg: KanbanCardConfig<T> = {};

  title(value: Accessor<T> | ValueFn<T>): this {
    this.cfg.title = value;
    return this;
  }

  description(value: Accessor<T> | ValueFn<T>): this {
    this.cfg.description = value;
    return this;
  }

  avatar(value: Accessor<T> | ((record: T) => string | undefined)): this {
    this.cfg.avatar = value;
    return this;
  }

  badge(
    field: Accessor<T>,
    options?: Omit<KanbanCardBadge<T>, "field">,
  ): this {
    this.cfg.badge = { field, ...options };
    return this;
  }

  meta(items: KanbanCardMeta<T>[]): this {
    this.cfg.meta = items;
    return this;
  }

  build(): KanbanCardConfig<T> {
    return { ...this.cfg };
  }
}
