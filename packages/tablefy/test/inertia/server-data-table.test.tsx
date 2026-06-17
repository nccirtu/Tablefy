import { render, screen } from "@testing-library/react";
import { ServerDataTable } from "../../src/inertia/server-data-table";
import { TableSchema } from "../../src/builders";
import { TextColumn } from "../../src/columns";

const schema = TableSchema.make<any>()
  .sortable({ id: "name", desc: false })
  .paginated({ pageSize: 15 })
  .columns(TextColumn.make("name").label("Name"))
  .build();

const paginator = {
  data: [{ name: "Alice" }],
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 1,
  from: 1,
  to: 1,
};

describe("ServerDataTable", () => {
  it("renders the current page from a paginator", () => {
    render(
      <ServerDataTable schema={schema} paginator={paginator} url="/customers" />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText(/1–1 von 1/)).toBeInTheDocument();
  });
});
