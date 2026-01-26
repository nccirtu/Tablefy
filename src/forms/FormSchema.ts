import { FieldDefinition } from "./types/field";
import { FormConfig, FormSection, ActionsPosition } from "./types/form";
import { SectionBuilder } from "./builders/section";
import { ActionsBuilder } from "./builders/actions";

export class FormSchema<TData = any> {
  private config: FormConfig<TData>;

  constructor() {
    this.config = {
      fields: new Map(),
      columns: 1,
      actionsPosition: "end",
      spacing: "normal",
    };
  }

  static make<TData>(): FormSchema<TData> {
    return new FormSchema<TData>();
  }

  title(title: string | ((data: TData) => string)): this {
    this.config.title = title;
    return this;
  }

  description(description: string | ((data: TData) => string)): this {
    this.config.description = description;
    return this;
  }

  fields(...fields: FieldDefinition<TData, any>[]): this {
    fields.forEach((field) => {
      this.config.fields.set(field.config.name, field);
    });
    return this;
  }

  sections(...sections: (FormSection<TData> | SectionBuilder<TData>)[]): this {
    this.config.sections = sections.map((section) =>
      section instanceof SectionBuilder ? section.build() : section,
    );
    return this;
  }

  actions(builder: (builder: ActionsBuilder) => ActionsBuilder): this {
    const actionsBuilder = new ActionsBuilder();
    this.config.actions = builder(actionsBuilder).build();
    return this;
  }

  actionsPosition(position: ActionsPosition): this {
    this.config.actionsPosition = position;
    return this;
  }

  columns(columns: number): this {
    this.config.columns = columns;
    return this;
  }

  bordered(bordered: boolean = true): this {
    this.config.bordered = bordered;
    return this;
  }

  spacing(spacing: "compact" | "normal" | "relaxed"): this {
    this.config.spacing = spacing;
    return this;
  }

  build(): FormConfig<TData> {
    return this.config;
  }
}
