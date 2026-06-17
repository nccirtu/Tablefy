import { FormSchema, TextInput, Select } from "../../src/forms";

describe("FormSchema", () => {
  it("builds fields and config", () => {
    const result = FormSchema.make<any>()
      .title("Create")
      .columns(2)
      .fields(
        TextInput.make("name").label("Name").required(),
        Select.make("role").options([{ value: "a", label: "A" }]),
      )
      .build();

    expect(result.fields).toHaveLength(2);
    expect(result.fields[0].name).toBe("name");
    expect(result.fields[1].name).toBe("role");
    expect(result.config.columns).toBe(2);
    expect(result.config.title).toBe("Create");
  });

  it("wires submit/cancel actions via the actions builder", () => {
    const result = FormSchema.make<any>()
      .fields(TextInput.make("name"))
      .actions((a) => a.submit({ label: "Speichern" }).cancel({ label: "Abbrechen" }))
      .build();

    expect(result.config.actions).toBeDefined();
  });
});
