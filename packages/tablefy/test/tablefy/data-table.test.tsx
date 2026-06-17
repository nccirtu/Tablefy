import { render, screen, fireEvent } from "@testing-library/react";
import { DataTable } from "../../src/tablefy/data-table";
import { TextColumn } from "../../src/columns";
import { TableSchema } from "../../src/builders";

const columns = [TextColumn.make<any>("name").label("Name").build()] as any;
const rows = [{ name: "Alice" }, { name: "Bob" }];

describe("DataTable", () => {
  it("renders rows in client mode", () => {
    render(<DataTable columns={columns} data={rows} config={{}} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("accepts a built TableSchema via the `schema` prop", () => {
    const schema = TableSchema.make<any>()
      .columns(TextColumn.make<any>("name").label("Name"))
      .build();
    render(<DataTable schema={schema} data={rows} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders a selection checkbox column when row selection is enabled", () => {
    const { container } = render(
      <DataTable columns={columns} data={rows} config={{ enableRowSelection: true }} />,
    );
    // header select-all + one per row.
    expect(
      container.querySelectorAll('[data-ui="Checkbox"]').length,
    ).toBeGreaterThanOrEqual(rows.length + 1);
  });

  it("bulkActions() enables selection and stores the actions", () => {
    const schema = TableSchema.make<any>()
      .bulkActions([{ label: "Löschen", onClick: () => {} }])
      .columns(TextColumn.make<any>("name").label("Name"))
      .build();
    expect(schema.config.enableRowSelection).toBe(true);
    expect(schema.config.bulkActions).toHaveLength(1);
  });

  it("shows skeleton rows when data is undefined (deferred/loading)", () => {
    const { container } = render(
      <DataTable columns={columns} data={undefined} config={{}} skeletonRows={3} />,
    );
    // 3 skeleton rows × 1 column = 3 skeleton cells; no real data shown.
    expect(container.querySelectorAll('[data-ui="Skeleton"]')).toHaveLength(3);
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("shows server pagination meta and wires page changes", () => {
    const server = {
      state: { search: "", sort: null, page: 1, perPage: 15, filters: {} },
      meta: { current_page: 1, last_page: 3, per_page: 15, total: 42, from: 1, to: 15 },
      setSearch: jest.fn(),
      setSort: jest.fn(),
      setPage: jest.fn(),
      setPerPage: jest.fn(),
      setFilter: jest.fn(),
      resetFilters: jest.fn(),
    };

    render(
      <DataTable
        columns={columns}
        data={[rows[0]]}
        config={{ pagination: { enabled: true } }}
        server={server as any}
      />,
    );

    expect(screen.getByText(/1–15 von 42/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Nächste Seite"));
    expect(server.setPage).toHaveBeenCalledWith(2);
  });
});
