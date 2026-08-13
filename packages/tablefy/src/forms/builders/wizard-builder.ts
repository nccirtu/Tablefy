import { ReactNode } from "react";
import { WizardStepConfig, FormBodyItemConfig } from "../types/layout";
import { BuiltField } from "../types/form";
import { Section } from "./section-builder";
import { FormRow } from "./form-row";

type FieldBuilder<TData extends Record<string, any>> = {
  build(): BuiltField<TData>;
};

type StepChild<TData extends Record<string, any>> =
  | FieldBuilder<TData>
  | Section<TData>
  | FormRow<TData>
  | ReactNode;

function isSection(child: any): child is Section<any> {
  return !!child && typeof child.buildSection === "function";
}
function isRow(child: any): child is FormRow<any> {
  return !!child && typeof child.buildRow === "function";
}
function isFieldBuilder(child: any): child is FieldBuilder<any> {
  return !!child && typeof child.build === "function";
}

/** A wizard step. Fields/Sections/nodes live directly inside via `.schema()`. */
export class WizardStep<TData extends Record<string, any>> {
  readonly kind = "step" as const;
  private stepConfig: Omit<WizardStepConfig<TData>, "items">;
  private children: StepChild<TData>[] = [];

  constructor(label: string) {
    this.stepConfig = {
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
    };
  }

  static make<TData extends Record<string, any> = any>(
    label: string,
  ): WizardStep<TData> {
    return new WizardStep(label);
  }

  id(id: string): this {
    this.stepConfig.id = id;
    return this;
  }

  description(description: string): this {
    this.stepConfig.description = description;
    return this;
  }

  icon(icon: ReactNode): this {
    this.stepConfig.icon = icon;
    return this;
  }

  canProceed(fn: (data: TData) => boolean): this {
    this.stepConfig.canProceed = fn;
    return this;
  }

  beforeNext(fn: (data: TData) => Promise<boolean> | boolean): this {
    this.stepConfig.beforeNext = fn;
    return this;
  }

  /** Fields, Sections, FormRows and/or React nodes that live in this step. */
  schema(children: StepChild<TData>[]): this {
    this.children = children;
    return this;
  }

  buildStep(): { step: WizardStepConfig<TData>; fields: BuiltField<TData>[] } {
    const fields: BuiltField<TData>[] = [];
    const items: FormBodyItemConfig<TData>[] = [];

    for (const child of this.children) {
      if (isSection(child)) {
        const built = child.buildSection();
        fields.push(...built.fields);
        items.push({ kind: "section", section: built.section });
      } else if (isRow(child)) {
        const built = child.buildRow();
        fields.push(...built.fields);
        items.push({
          kind: "row",
          fields: built.row.fields,
          columns: built.row.columns,
        });
      } else if (isFieldBuilder(child)) {
        const f = child.build();
        fields.push(f);
        items.push({ kind: "field", name: f.name });
      } else {
        items.push({ kind: "node", node: child as ReactNode });
      }
    }

    return { step: { ...this.stepConfig, items }, fields };
  }
}
