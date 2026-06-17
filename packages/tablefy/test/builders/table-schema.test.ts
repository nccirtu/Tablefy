import { TableSchema, SelectFilter } from "../../src/builders";
import { TextColumn } from "../../src/columns";

describe("TableSchema", () => {
  it("builds columns and config from the fluent API", () => {
    const { columns, config } = TableSchema.make<any>()
      .searchable({ placeholder: "Suchen" })
      .sortable({ id: "name", desc: false })
      .paginated({ pageSize: 20, pageSizeOptions: [20, 50] })
      .striped()
      .columns(TextColumn.make("name").label("Name").sortable())
      .build();

    expect(columns).toHaveLength(1);
    expect((columns[0] as any).accessorKey).toBe("name");
    expect(config.search).toEqual({ enabled: true, placeholder: "Suchen" });
    expect(config.enableSorting).toBe(true);
    expect(config.defaultSort).toEqual({ id: "name", desc: false });
    expect(config.pagination).toMatchObject({ enabled: true, pageSize: 20 });
    expect(config.striped).toBe(true);
  });

  it("normalizes both filter builders and plain FilterConfig objects", () => {
    const { config } = TableSchema.make<any>()
      .filters(
        SelectFilter.make("status")
          .label("Status")
          .options([{ value: "active", label: "Aktiv" }]),
        { id: "type", column: "type", label: "Type", type: "text" },
      )
      .build();

    expect(config.filters).toHaveLength(2);
    expect(config.filters?.[0]).toMatchObject({
      column: "status",
      type: "select",
      label: "Status",
    });
    expect(config.filters?.[1]).toMatchObject({ column: "type", type: "text" });
  });

  it("supports boolean shorthand for searchable/paginated", () => {
    const { config } = TableSchema.make<any>()
      .searchable(false)
      .paginated(true)
      .build();
    expect(config.search).toEqual({ enabled: false });
    expect(config.pagination).toEqual({ enabled: true });
  });
});
