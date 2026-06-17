import {
  SelectFilter,
  TernaryFilter,
  TextFilter,
  DateFilter,
} from "../../src/builders";

describe("filter builders", () => {
  it("SelectFilter builds a select FilterConfig", () => {
    const f = SelectFilter.make("status")
      .label("Status")
      .options([{ value: "a", label: "A" }])
      .build();
    expect(f).toMatchObject({
      id: "status",
      column: "status",
      label: "Status",
      type: "select",
    });
    expect(f.options).toHaveLength(1);
  });

  it("SelectFilter.multiple() switches to multi-select", () => {
    expect(SelectFilter.make("s").multiple().build().type).toBe("multi-select");
    expect(SelectFilter.make("s").multiple(false).build().type).toBe("select");
  });

  it("TernaryFilter carries labels", () => {
    const f = TernaryFilter.make("verified").labels("Ja", "Nein").build();
    expect(f.type).toBe("boolean");
    expect(f.trueLabel).toBe("Ja");
    expect(f.falseLabel).toBe("Nein");
  });

  it("TextFilter and DateFilter", () => {
    expect(TextFilter.make("q").build().type).toBe("text");
    expect(DateFilter.make("d").build().type).toBe("date");
    expect(DateFilter.make("d").range().build().type).toBe("date-range");
  });

  it("defaults label to the column when not set", () => {
    expect(SelectFilter.make("created_at").build().label).toBe("created_at");
  });
});
