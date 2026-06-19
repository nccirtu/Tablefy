import { KanbanSchema } from "../../src/kanban";
import { CardSchema, CardRow } from "../../src/card";
import { TextColumn, BadgeColumn } from "../../src/columns";

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

  it("accepts a shared CardSchema for the card content", () => {
    const card = CardSchema.make<Task>()
      .image("image_url")
      .heading(TextColumn.make("title"))
      .rows([CardRow.make([BadgeColumn.make("status")])])
      .build();

    const { config } = KanbanSchema.make<Task>()
      .groupBy("status")
      .card(card)
      .build();

    expect(config.card?.config.image).toBe("image_url");
    expect(config.card?.config.heading?.getAccessor()).toBe("title");
    expect(config.card?.config.rows[0].cells).toHaveLength(1);
  });

  it("omits columns for the dynamic/backend-driven case", () => {
    const { config } = KanbanSchema.make<Task>().groupBy("status").build();
    expect(config.columns).toBeUndefined();
  });
});
