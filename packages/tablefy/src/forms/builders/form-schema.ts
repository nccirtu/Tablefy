import { ReactNode } from "react";
import { FormSchemaConfig, FormBuildResult, BuiltField } from "../types/form";
import {
  TabConfig,
  WizardStepConfig,
  FormBodyItemConfig,
} from "../types/layout";
import { ActionsBuilder } from "./actions-builder";
import { Section } from "./section-builder";
import { FormRow } from "./form-row";
import { Tab } from "./tab-builder";
import { WizardStep } from "./wizard-builder";

type FieldBuilder<TData extends Record<string, any>> = {
  build(): BuiltField<TData>;
};

/** A top-level form node: field builder, Section, FormRow, or any React node. */
type FormNode<TData extends Record<string, any>> =
  | FieldBuilder<TData>
  | Section<TData>
  | FormRow<TData>
  | ReactNode;

function isSection(node: any): node is Section<any> {
  return !!node && typeof node.buildSection === "function";
}
function isRow(node: any): node is FormRow<any> {
  return !!node && typeof node.buildRow === "function";
}
function isFieldBuilder(node: any): node is FieldBuilder<any> {
  return !!node && typeof node.build === "function";
}

/**
 * Form Schema Builder — fields, layout and arbitrary components in one pass.
 * `.schema([...])` takes field builders, Sections, FormRows or any React node
 * (Alert, image, …), in render order. Tabs/wizard select the top-level layout
 * mode via `.tabs()` / `.wizard()`.
 */
export class FormSchema<TData extends Record<string, any>> {
  private nodes: FormNode<TData>[] = [];
  private tabBuilders: Tab<TData>[] = [];
  private wizardBuilders: WizardStep<TData>[] = [];
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

  // --- Layout (fields + sections + components in one pass) ---

  /** Field builders, Sections, FormRows and/or React nodes — in render order. */
  schema(nodes: FormNode<TData>[]): this {
    this.nodes = nodes;
    return this;
  }

  tabs(...tabs: Tab<TData>[]): this {
    this.tabBuilders = tabs;
    return this;
  }

  wizard(...steps: WizardStep<TData>[]): this {
    this.wizardBuilders = steps;
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
    const fields: BuiltField<TData>[] = [];
    let body: FormBodyItemConfig<TData>[] | undefined;
    let tabs: TabConfig<TData>[] | undefined;
    let wizardSteps: WizardStepConfig<TData>[] | undefined;

    // Wizard / tabs own the layout when present; otherwise the schema() nodes do.
    if (this.wizardBuilders.length) {
      wizardSteps = [];
      for (const wb of this.wizardBuilders) {
        const built = wb.buildStep();
        wizardSteps.push(built.step);
        fields.push(...built.fields);
      }
    } else if (this.tabBuilders.length) {
      tabs = [];
      for (const tb of this.tabBuilders) {
        const built = tb.buildTab();
        tabs.push(built.tab);
        fields.push(...built.fields);
      }
    } else {
      const items: FormBodyItemConfig<TData>[] = [];
      for (const node of this.nodes) {
        if (isSection(node)) {
          const built = node.buildSection();
          fields.push(...built.fields);
          items.push({ kind: "section", section: built.section });
        } else if (isRow(node)) {
          const built = node.buildRow();
          fields.push(...built.fields);
          items.push({
            kind: "row",
            fields: built.row.fields,
            columns: built.row.columns,
          });
        } else if (isFieldBuilder(node)) {
          const f = node.build();
          fields.push(f);
          items.push({ kind: "field", name: f.name });
        } else {
          items.push({ kind: "node", node: node as ReactNode });
        }
      }
      if (items.length) body = items;
    }

    return {
      fields,
      config: {
        ...(this.schemaConfig as FormSchemaConfig<TData>),
        fields,
        body,
        tabs,
        wizardSteps,
      },
    };
  }
}
