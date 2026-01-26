import { FormSection } from "../types/form";

export class SectionBuilder<TData = any> {
  private section: FormSection<TData>;

  constructor(title?: string) {
    this.section = {
      title,
      fields: [],
    };
  }

  static make<TData>(title?: string): SectionBuilder<TData> {
    return new SectionBuilder<TData>(title);
  }

  description(description: string): this {
    this.section.description = description;
    return this;
  }

  fields(fields: (keyof TData & string)[]): this {
    this.section.fields = fields;
    return this;
  }

  collapsible(collapsible: boolean = true): this {
    this.section.collapsible = collapsible;
    return this;
  }

  collapsed(collapsed: boolean = true): this {
    this.section.collapsed = collapsed;
    return this;
  }

  columns(columns: number): this {
    this.section.columns = columns;
    return this;
  }

  build(): FormSection<TData> {
    return this.section;
  }
}
