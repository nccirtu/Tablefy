import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";

export class Hidden<TData = any, TValue = any> extends BaseField<
  TData,
  TValue
> {
  constructor(name: keyof TData & string) {
    super(name, "hidden");
  }

  static make<TData, TValue = any>(
    name: keyof TData & string,
  ): Hidden<TData, TValue> {
    return new Hidden<TData, TValue>(name);
  }

  protected render(props: FieldRenderProps<TData, TValue>) {
    // Hidden fields don't render anything visible
    return null;
  }
}
