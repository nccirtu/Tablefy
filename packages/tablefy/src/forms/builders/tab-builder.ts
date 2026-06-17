import { ReactNode } from "react";
import { TabConfig, SectionConfig } from "../types/layout";

export class TabBuilder<TData extends Record<string, any>> {
  private tabConfig: TabConfig<TData>;

  constructor(label: string) {
    this.tabConfig = {
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
    };
  }

  static make<TData extends Record<string, any>>(
    label: string,
  ): TabBuilder<TData> {
    return new TabBuilder(label);
  }

  id(id: string): this {
    this.tabConfig.id = id;
    return this;
  }

  icon(icon: ReactNode): this {
    this.tabConfig.icon = icon;
    return this;
  }

  fields(fields: string[]): this {
    this.tabConfig.fields = fields;
    return this;
  }

  sections(
    ...sections: { build(): SectionConfig<TData> }[]
  ): this {
    this.tabConfig.sections = sections.map((s) => s.build());
    return this;
  }

  badge(
    badge: string | number | ((data: TData) => string | number),
  ): this {
    this.tabConfig.badge = badge;
    return this;
  }

  disabled(fn: (data: TData) => boolean): this {
    this.tabConfig.disabled = fn;
    return this;
  }

  build(): TabConfig<TData> {
    return { ...this.tabConfig };
  }
}
