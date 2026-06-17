import React, { ReactNode } from "react";
import { BaseField } from "./base-field";
import { HiddenConfig } from "../types/field";
import { FieldType, FieldRenderProps } from "../types/form";

export class Hidden<
  TData extends Record<string, any>,
> extends BaseField<TData, HiddenConfig<TData>> {
  readonly fieldType: FieldType = "hidden";

  static make<TData extends Record<string, any>>(
    name: string & keyof TData | string,
  ): Hidden<TData> {
    return new Hidden(name);
  }

  renderField({ value }: FieldRenderProps<TData>): ReactNode {
    return <input type="hidden" name={this.config.name} value={value ?? ""} />;
  }
}
