import {
  FormSchema,
  Section,
  FormRow,
  Tab,
  TextInput,
  Select,
} from "../../src/forms";

describe("FormSchema", () => {
  it("builds fields and config", () => {
    const result = FormSchema.make<any>()
      .title("Create")
      .columns(2)
      .schema([
        TextInput.make("name").label("Name").required(),
        Select.make("role").options([{ value: "a", label: "A" }]),
      ])
      .build();

    expect(result.fields).toHaveLength(2);
    expect(result.fields[0].name).toBe("name");
    expect(result.fields[1].name).toBe("role");
    expect(result.config.columns).toBe(2);
    expect(result.config.title).toBe("Create");
  });

  it("wires submit/cancel actions via the actions builder", () => {
    const result = FormSchema.make<any>()
      .schema([TextInput.make("name")])
      .actions((a) => a.submit({ label: "Speichern" }).cancel({ label: "Abbrechen" }))
      .build();

    expect(result.config.actions).toBeDefined();
  });

  it("flattens fields from sections into the body", () => {
    const result = FormSchema.make<any>()
      .schema([
        Section.make("Stammdaten")
          .columns(2)
          .schema([TextInput.make("name"), TextInput.make("email")]),
        Section.make("Status").schema([Select.make("status")]),
      ])
      .build();

    // Flat list is the source of truth (submit/defaults iterate this).
    expect(result.fields.map((f) => f.name)).toEqual([
      "name",
      "email",
      "status",
    ]);
    const body = result.config.body!;
    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({ kind: "section" });
    const first = (body[0] as any).section;
    expect(first.fields).toEqual(["name", "email"]);
    expect(first.items.map((i: any) => i.kind)).toEqual(["field", "field"]);
  });

  it("produces row items when a section uses FormRow", () => {
    const result = FormSchema.make<any>()
      .schema([
        Section.make("Layout").schema([
          FormRow.make([TextInput.make("a"), TextInput.make("b")]),
          FormRow.make([TextInput.make("c")]).columns(1),
        ]),
      ])
      .build();

    expect(result.fields.map((f) => f.name)).toEqual(["a", "b", "c"]);
    const items = (result.config.body![0] as any).section.items;
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ kind: "row", fields: ["a", "b"], columns: undefined });
    expect(items[1]).toEqual({ kind: "row", fields: ["c"], columns: 1 });
  });

  it("keeps arbitrary nodes in the body as node items", () => {
    const result = FormSchema.make<any>()
      .schema([
        TextInput.make("a"),
        "a-react-node",
        Section.make("S").schema([TextInput.make("b")]),
      ])
      .build();

    const body = result.config.body!;
    expect(body.map((i: any) => i.kind)).toEqual(["field", "node", "section"]);
    expect((body[1] as any).node).toBe("a-react-node");
    // The node is NOT a field — flat fields stay clean for submit.
    expect(result.fields.map((f) => f.name)).toEqual(["a", "b"]);
  });

  it("collects fields from tabs into ordered items", () => {
    const result = FormSchema.make<any>()
      .tabs(
        Tab.make("General").schema([TextInput.make("name")]),
        Tab.make("Meta").schema([
          Section.make("SEO").schema([TextInput.make("slug")]),
        ]),
      )
      .build();

    expect(result.fields.map((f) => f.name)).toEqual(["name", "slug"]);
    expect(result.config.tabs).toHaveLength(2);
    expect(result.config.tabs![0].items[0]).toEqual({ kind: "field", name: "name" });
    expect((result.config.tabs![1].items[0] as any).section.fields).toEqual([
      "slug",
    ]);
  });
});
