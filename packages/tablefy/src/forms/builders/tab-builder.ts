import { ReactNode } from "react";
import { TabConfig, FormBodyItemConfig } from "../types/layout";
import { BuiltField } from "../types/form";
import { Section } from "./section-builder";
import { FormRow } from "./form-row";

type FieldBuilder<TData extends Record<string, any>> = {
  build(): BuiltField<TData>;
};

type TabChild<TData extends Record<string, any>> =
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

/** A tab in a tabbed form. Fields/Sections/nodes live directly inside via `.schema()`. */
export class Tab<TData extends Record<string, any>> {
  readonly kind = "tab" as const;
  private tabConfig: Omit<TabConfig<TData>, "items">;
  private children: TabChild<TData>[] = [];

  constructor(label: string) {
    this.tabConfig = {
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
    };
  }

  static make<TData extends Record<string, any> = any>(
    label: string,
  ): Tab<TData> {
    return new Tab(label);
  }

  id(id: string): this {
    this.tabConfig.id = id;
    return this;
  }

  icon(icon: ReactNode): this {
    this.tabConfig.icon = icon;
    return this;
  }

  badge(
    badge: string | number | ((data: TData) => string | number),
  ): this {
    this.tabConfig.badge = badge;
    return this;
  }

  disabled(fn: (data: TData) => boolean): this {
    this.tabConfig.disabled = fn;
    return this;
  }

  /** Fields, Sections, FormRows and/or React nodes that live in this tab. */
  schema(children: TabChild<TData>[]): this {
    this.children = children;
    return this;
  }

  buildTab(): { tab: TabConfig<TData>; fields: BuiltField<TData>[] } {
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

    return { tab: { ...this.tabConfig, items }, fields };
  }
}
