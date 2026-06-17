import { ReactNode } from "react";
import { WizardStepConfig, SectionConfig } from "../types/layout";

export class WizardStep<TData extends Record<string, any>> {
  private stepConfig: WizardStepConfig<TData>;

  constructor(label: string) {
    this.stepConfig = {
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
    };
  }

  static make<TData extends Record<string, any>>(
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

  fields(fields: string[]): this {
    this.stepConfig.fields = fields;
    return this;
  }

  sections(
    ...sections: { build(): SectionConfig<TData> }[]
  ): this {
    this.stepConfig.sections = sections.map((s) => s.build());
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

  build(): WizardStepConfig<TData> {
    return { ...this.stepConfig };
  }
}
