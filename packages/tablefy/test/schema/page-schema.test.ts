import { PageSchema, Grid, Section, isSchemaNode } from "../../src/schema";

describe("PageSchema", () => {
  it("builds header config + a nested content tree", () => {
    const page = PageSchema.make()
      .title("Benutzer")
      .description("Alle")
      .headerActions((a) => a.button({ label: "Neu", href: "/x", icon: "plus" }))
      .schema([
        Grid.make(3).schema(["a", "b"]),
        Section.make("Liste").description("desc").collapsible().schema(["c"]),
      ])
      .build();

    expect(page.config.title).toBe("Benutzer");
    expect(page.config.description).toBe("Alle");
    expect(page.config.actions).toEqual([
      { label: "Neu", href: "/x", icon: "plus" },
    ]);

    const [grid, section] = page.config.content as any[];
    expect(isSchemaNode(grid)).toBe(true);
    expect(grid.type).toBe("grid");
    expect(grid.props.columns).toBe(3);
    expect(grid.children).toEqual(["a", "b"]); // raw leaves pass through

    expect(section.type).toBe("section");
    expect(section.props).toMatchObject({
      title: "Liste",
      description: "desc",
      collapsible: true,
    });
    expect(section.children).toEqual(["c"]);
  });

  it("nests recursively (Section > Grid > Section)", () => {
    const page = PageSchema.make()
      .schema([
        Section.make("Outer").schema([
          Grid.make(2).schema([Section.make("Inner").schema(["leaf"])]),
        ]),
      ])
      .build();

    const outer: any = page.config.content[0];
    expect(outer.type).toBe("section");
    const grid = outer.children[0];
    expect(grid.type).toBe("grid");
    const inner = grid.children[0];
    expect(inner.type).toBe("section");
    expect(inner.props.title).toBe("Inner");
    expect(inner.children[0]).toBe("leaf");
  });
});
