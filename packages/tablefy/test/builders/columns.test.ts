import { TextColumn } from "../../src/columns";

describe("column builders", () => {
  it("TextColumn.build() returns a ColumnDef with accessor + meta + renderers", () => {
    const col: any = TextColumn.make("name").label("Name").sortable().build();
    expect(col.accessorKey).toBe("name");
    expect(col.meta.visibilityLabel).toBe("Name");
    expect(typeof col.header).toBe("function");
    expect(typeof col.cell).toBe("function");
  });

  it("falls back to the accessor when no label is given", () => {
    const col: any = TextColumn.make("email").build();
    expect(col.accessorKey).toBe("email");
    expect(col.meta.visibilityLabel).toBe("email");
  });
});
