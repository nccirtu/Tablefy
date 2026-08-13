import { ReactNode } from "react";
import { SectionConfig, FormItemConfig } from "../types/layout";
import { BuiltField } from "../types/form";
import { FormRow } from "./form-row";

type FieldBuilder<TData extends Record<string, any>> = {
  build(): BuiltField<TData>;
};

/** A field builder, an explicit FormRow, or any React node (Alert, image, …). */
type SectionChild<TData extends Record<string, any>> =
  | FieldBuilder<TData>
  | FormRow<TData>
  | ReactNode;

function isRow(child: any): child is FormRow<any> {
  return !!child && typeof child.buildRow === "function";
}
function isFieldBuilder(child: any): child is FieldBuilder<any> {
  return !!child && typeof child.build === "function";
}

/**
 * Form section — a Card grouping fields. Children live directly inside via
 * `.schema([...])` (no string references): field builders, `FormRow`s, or any
 * React node. `.columns(n)` auto-flows fields; nodes/rows break out full-width.
 */
export class Section<TData extends Record<string, any>> {
  readonly kind = "section" as const;
  private sectionConfig: Omit<SectionConfig<TData>, "items">;
  private children: SectionChild<TData>[] = [];

  constructor(title: string) {
    this.sectionConfig = {
      id: title.toLowerCase().replace(/\s+/g, "-"),
      title,
      fields: [],
      columns: 1,
      collapsible: false,
      collapsed: false,
    };
  }

  static make<TData extends Record<string, any> = any>(
    title: string,
  ): Section<TData> {
    return new Section(title);
  }

  id(id: string): this {
    this.sectionConfig.id = id;
    return this;
  }

  description(description: string): this {
    this.sectionConfig.description = description;
    return this;
  }

  columns(columns: number): this {
    this.sectionConfig.columns = columns;
    return this;
  }

  collapsible(collapsible = true): this {
    this.sectionConfig.collapsible = collapsible;
    return this;
  }

  collapsed(collapsed = true): this {
    this.sectionConfig.collapsed = collapsed;
    this.sectionConfig.collapsible = true;
    return this;
  }

  icon(icon: ReactNode): this {
    this.sectionConfig.icon = icon;
    return this;
  }

  hidden(fn: (data: TData) => boolean): this {
    this.sectionConfig.hidden = fn;
    return this;
  }

  /** Fields, FormRows and/or React nodes that live in this section. */
  schema(children: SectionChild<TData>[]): this {
    this.children = children;
    return this;
  }

  /** Build the section config (ordered items) + the flat list of its fields. */
  buildSection(): {
    section: SectionConfig<TData>;
    fields: BuiltField<TData>[];
  } {
    const fields: BuiltField<TData>[] = [];
    const names: string[] = [];
    const items: FormItemConfig[] = [];

    for (const child of this.children) {
      if (isRow(child)) {
        const built = child.buildRow();
        fields.push(...built.fields);
        names.push(...built.fields.map((f) => f.name));
        items.push({
          kind: "row",
          fields: built.row.fields,
          columns: built.row.columns,
        });
      } else if (isFieldBuilder(child)) {
        const f = child.build();
        fields.push(f);
        names.push(f.name);
        items.push({ kind: "field", name: f.name });
      } else {
        items.push({ kind: "node", node: child as ReactNode });
      }
    }

    const section: SectionConfig<TData> = {
      ...this.sectionConfig,
      fields: names,
      items,
    };
    return { section, fields };
  }
}
