import { FormSchemaConfig, FormBuildResult, BuiltField } from "../types/form";
import { SectionConfig, TabConfig, WizardStepConfig } from "../types/layout";
import { FormActionConfig } from "../types/actions";
import { ActionsBuilder } from "./actions-builder";

type FieldBuilder<TData extends Record<string, any>> = {
  build(): BuiltField<TData>;
};

/**
 * Form Schema Builder
 * Fluent API for building complete form configurations
 */
export class FormSchema<TData extends Record<string, any>> {
  private fieldBuilders: FieldBuilder<TData>[] = [];
  private schemaConfig: Partial<FormSchemaConfig<TData>> = {};

  static make<TData extends Record<string, any>>(): FormSchema<TData> {
    return new FormSchema();
  }

  // --- Configuration ---

  title(title: string | ((data: TData) => string)): this {
    this.schemaConfig.title = title;
    return this;
  }

  description(description: string | ((data: TData) => string)): this {
    this.schemaConfig.description = description;
    return this;
  }

  columns(columns: number): this {
    this.schemaConfig.columns = columns;
    return this;
  }

  bordered(bordered = true): this {
    this.schemaConfig.bordered = bordered;
    return this;
  }

  spacing(spacing: "compact" | "normal" | "relaxed"): this {
    this.schemaConfig.spacing = spacing;
    return this;
  }

  disabled(disabled: boolean | ((data: TData) => boolean)): this {
    this.schemaConfig.disabled = disabled;
    return this;
  }

  // --- Fields ---

  fields(...builders: FieldBuilder<TData>[]): this {
    this.fieldBuilders.push(...builders);
    return this;
  }

  // --- Layout ---

  sections(
    ...sections: { build(): SectionConfig<TData> }[]
  ): this {
    this.schemaConfig.sections = sections.map((s) => s.build());
    return this;
  }

  tabs(...tabs: { build(): TabConfig<TData> }[]): this {
    this.schemaConfig.tabs = tabs.map((t) => t.build());
    return this;
  }

  wizard(
    ...steps: { build(): WizardStepConfig<TData> }[]
  ): this {
    this.schemaConfig.wizardSteps = steps.map((s) => s.build());
    return this;
  }

  // --- Actions ---

  actions(
    fn: (builder: ActionsBuilder<TData>) => ActionsBuilder<TData>,
  ): this {
    const builder = new ActionsBuilder<TData>();
    this.schemaConfig.actions = fn(builder).build();
    return this;
  }

  actionsPosition(position: "start" | "end" | "between" | "center"): this {
    this.schemaConfig.actionsPosition = position;
    return this;
  }

  // --- Build ---

  build(): FormBuildResult<TData> {
    const fields = this.fieldBuilders.map((b) => b.build());
    return {
      fields,
      config: {
        ...(this.schemaConfig as FormSchemaConfig<TData>),
        fields,
      },
    };
  }
}
