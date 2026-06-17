import { render, screen } from "@testing-library/react";
import { DataTableFilters } from "../../src/tablefy/data-table-filters";
import { FilterConfig } from "../../src/types";

const filters: FilterConfig[] = [
  {
    id: "status",
    column: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Aktiv" },
      { value: "inactive", label: "Inaktiv" },
    ],
  },
];

describe("DataTableFilters", () => {
  it("renders nothing without filters", () => {
    const { container } = render(
      <DataTableFilters
        filters={[]}
        values={{}}
        onChange={jest.fn()}
        onReset={jest.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the active filter count", () => {
    render(
      <DataTableFilters
        filters={filters}
        values={{ status: "active" }}
        onChange={jest.fn()}
        onReset={jest.fn()}
      />,
    );
    // Filter label appears and the active count badge reads "1".
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
