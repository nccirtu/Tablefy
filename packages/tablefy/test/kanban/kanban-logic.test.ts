import {
  withOrphanColumns,
  groupRecords,
  locateItem,
  getByPath,
} from "../../src/kanban/utils";

interface Task {
  id: number;
  status: string;
  company?: { name: string };
}

const cols = [
  { id: "todo", label: "To do" },
  { id: "done", label: "Done" },
];

const records: Task[] = [
  { id: 1, status: "todo" },
  { id: 2, status: "done" },
  { id: 3, status: "todo" },
  { id: 4, status: "archived" }, // no matching column → orphan
];

const itemValue = (t: Task) => String(t.id);

describe("kanban logic", () => {
  describe("withOrphanColumns", () => {
    it("appends a column for group values without a defined column", () => {
      const result = withOrphanColumns(cols, records, "status");
      expect(result.map((c) => c.id)).toEqual(["todo", "done", "archived"]);
    });

    it("returns the same columns when there are no orphans", () => {
      const noOrphans = records.slice(0, 3);
      const result = withOrphanColumns(cols, noOrphans, "status");
      expect(result).toBe(cols);
    });
  });

  describe("groupRecords", () => {
    it("groups records by the group field, keeping empty columns + order", () => {
      const grouped = groupRecords(records.slice(0, 3), cols, "status");
      expect(Object.keys(grouped)).toEqual(["todo", "done"]);
      expect(grouped.todo.map((t) => t.id)).toEqual([1, 3]);
      expect(grouped.done.map((t) => t.id)).toEqual([2]);
    });

    it("creates a bucket for an unmapped value", () => {
      const grouped = groupRecords(records, cols, "status");
      expect(grouped.archived.map((t) => t.id)).toEqual([4]);
    });
  });

  describe("locateItem", () => {
    it("finds a card's column and index", () => {
      const grouped = groupRecords(records.slice(0, 3), cols, "status");
      expect(locateItem(grouped, "3", itemValue)).toMatchObject({
        col: "todo",
        idx: 1,
      });
    });

    it("returns null for an unknown id", () => {
      const grouped = groupRecords(records, cols, "status");
      expect(locateItem(grouped, "999", itemValue)).toBeNull();
    });

    it("detects a cross-column move (origin vs destination differ)", () => {
      const before = groupRecords(records.slice(0, 3), cols, "status");
      // simulate task 3 dragged from "todo" to "done"
      const after = {
        todo: [before.todo[0]],
        done: [before.done[0], before.todo[1]],
      };
      const start = locateItem(before, "3", itemValue);
      const end = locateItem(after, "3", itemValue);
      expect(start).toMatchObject({ col: "todo", idx: 1 });
      expect(end).toMatchObject({ col: "done", idx: 1 });
    });
  });

  describe("getByPath", () => {
    it("resolves dot paths and shallow keys", () => {
      expect(getByPath(records[0], "status")).toBe("todo");
      expect(getByPath({ company: { name: "Acme" } }, "company.name")).toBe(
        "Acme",
      );
      expect(getByPath({}, "company.name")).toBeUndefined();
    });
  });
});
