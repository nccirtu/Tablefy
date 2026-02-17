import { FormActionConfig } from "../types/actions";

export class ActionsBuilder<TData extends Record<string, any>> {
  private actionsList: FormActionConfig<TData>[] = [];

  submit(
    opts: Partial<Omit<FormActionConfig<TData>, "type">> & {
      label?: string;
    } = {},
  ): this {
    this.actionsList.push({
      type: "submit",
      label: opts.label || "Submit",
      variant: opts.variant || "default",
      ...opts,
    });
    return this;
  }

  cancel(
    opts: Partial<Omit<FormActionConfig<TData>, "type">> & {
      label?: string;
    } = {},
  ): this {
    this.actionsList.push({
      type: "cancel",
      label: opts.label || "Cancel",
      variant: opts.variant || "outline",
      ...opts,
    });
    return this;
  }

  custom(opts: Omit<FormActionConfig<TData>, "type"> & { label: string }): this {
    this.actionsList.push({ ...opts, type: "custom" });
    return this;
  }

  build(): FormActionConfig<TData>[] {
    return [...this.actionsList];
  }
}
