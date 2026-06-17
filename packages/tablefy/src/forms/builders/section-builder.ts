import { ReactNode } from "react";
import { SectionConfig } from "../types/layout";

export class SectionBuilder<TData extends Record<string, any>> {
  private sectionConfig: SectionConfig<TData>;

  constructor(title: string) {
    this.sectionConfig = {
      id: title.toLowerCase().replace(/\s+/g, "-"),
      title,
      fields: [],
      columns: 1,
      collapsible: false,
      collapsed: false,
    };
  }

  static make<TData extends Record<string, any>>(
    title: string,
  ): SectionBuilder<TData> {
    return new SectionBuilder(title);
  }

  id(id: string): this {
    this.sectionConfig.id = id;
    return this;
  }

  description(description: string): this {
    this.sectionConfig.description = description;
    return this;
  }

  fields(fields: string[]): this {
    this.sectionConfig.fields = fields;
    return this;
  }

  columns(columns: number): this {
    this.sectionConfig.columns = columns;
    return this;
  }

  collapsible(collapsible = true): this {
    this.sectionConfig.collapsible = collapsible;
    return this;
  }

  collapsed(collapsed = true): this {
    this.sectionConfig.collapsed = collapsed;
    this.sectionConfig.collapsible = true;
    return this;
  }

  icon(icon: ReactNode): this {
    this.sectionConfig.icon = icon;
    return this;
  }

  hidden(fn: (data: TData) => boolean): this {
    this.sectionConfig.hidden = fn;
    return this;
  }

  build(): SectionConfig<TData> {
    return { ...this.sectionConfig };
  }
}
