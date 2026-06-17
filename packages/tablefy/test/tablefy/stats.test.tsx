import { render, screen } from "@testing-library/react";
import { TablefyStats } from "../../src/tablefy/stats";
import { Stats } from "../../src/builders/stats";
import type { StatData } from "../../src/types/stats";

const stats: StatData[] = [
  { name: "total", label: "Kunden", value: 42, icon: "users", color: "success" },
  {
    name: "new",
    label: "Neu",
    value: 7,
    description: "diesen Monat",
    trend: { direction: "up", label: "+12%" },
  },
];

describe("TablefyStats", () => {
  it("renders cards from backend stat data", () => {
    render(<TablefyStats data={stats} />);
    expect(screen.getByText("Kunden")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("+12%")).toBeInTheDocument();
    expect(screen.getByText("diesen Monat")).toBeInTheDocument();
  });

  it("shows skeleton cards when data is undefined (deferred)", () => {
    const { container } = render(
      <TablefyStats data={undefined} skeletonCount={3} />,
    );
    expect(container.querySelectorAll('[data-ui="Skeleton"]').length).toBeGreaterThan(0);
    expect(screen.queryByText("Kunden")).not.toBeInTheDocument();
  });

  it("lets a Stats schema override a single card by name", () => {
    const schema = Stats.make()
      .columns(2)
      .renderStat("total", (s) => <div>custom-{s.value}</div>);
    render(<TablefyStats data={stats} schema={schema} />);
    expect(screen.getByText("custom-42")).toBeInTheDocument();
    // The non-overridden stat still renders the default card.
    expect(screen.getByText("Neu")).toBeInTheDocument();
  });
});
