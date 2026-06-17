import { KanbanSchema } from "../../src/kanban";

interface Task {
  id: number;
  title: string;
  status: string;
  company: { name: string };
}

describe("KanbanSchema", () => {
  it("builds groupBy, static columns and drag flags", () => {
    const { config } = KanbanSchema.make<Task>()
      .groupBy("status")
      .columns([
        { id: "todo", label: "To do", color: "amber" },
        { id: "done", label: "Done", color: "green" },
      ])
      .sortable()
      .columnsMovable()
      .build();

    expect(config.groupBy).toBe("status");
    expect(config.columns).toHaveLength(2);
    expect(config.columns?.[0]).toMatchObject({ id: "todo", color: "amber" });
    expect(config.sortable).toBe(true);
    expect(config.columnsMovable).toBe(true);
  });

  it("builds the card config via the card builder", () => {
    const { config } = KanbanSchema.make<Task>()
      .groupBy("status")
      .card((c) =>
        c
          .title("title")
          .description((t) => t.company.name)
          .badge("status", { colors: { todo: "amber" } })
          .meta([{ field: "id", label: "#" }]),
      )
      .build();

    expect(config.card.title).toBe("title");
    expect(typeof config.card.description).toBe("function");
    expect(config.card.badge).toMatchObject({
      field: "status",
      colors: { todo: "amber" },
    });
    expect(config.card.meta).toEqual([{ field: "id", label: "#" }]);
  });

  it("omits columns for the dynamic/backend-driven case", () => {
    const { config } = KanbanSchema.make<Task>()
      .groupBy("status")
      .card((c) => c.title("title"))
      .build();

    expect(config.columns).toBeUndefined();
  });
});
