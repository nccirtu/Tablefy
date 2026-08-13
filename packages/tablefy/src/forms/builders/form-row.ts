import { BuiltField } from "../types/form";
import { FormRowConfig } from "../types/layout";

type FieldBuilder<TData extends Record<string, any>> = {
  build(): BuiltField<TData>;
};

/**
 * One explicit row of fields inside a Section — the form analogue of CardRow.
 * Fields are laid out side-by-side; `.columns(n)` overrides the grid width
 * (defaults to the number of fields).
 */
export class FormRow<TData extends Record<string, any>> {
  readonly kind = "row" as const;
  private fieldBuilders: FieldBuilder<TData>[];
  private cols?: number;

  private constructor(fields: FieldBuilder<TData>[]) {
    this.fieldBuilders = fields;
  }

  static make<TData extends Record<string, any> = any>(
    fields: FieldBuilder<TData>[],
  ): FormRow<TData> {
    return new FormRow(fields);
  }

  columns(n: number): this {
    this.cols = n;
    return this;
  }

  buildRow(): { row: FormRowConfig; fields: BuiltField<TData>[] } {
    const fields = this.fieldBuilders.map((b) => b.build());
    return {
      row: { fields: fields.map((f) => f.name), columns: this.cols },
      fields,
    };
  }
}
