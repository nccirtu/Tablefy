import { render, screen } from "@testing-library/react";
import { TablefyPage } from "../../src/inertia/tablefy-page";
import { PageSchema, Section } from "../../src/schema";

describe("TablefyPage (generated page pattern)", () => {
  it("renders title + header action and skips a falsy conditional item", () => {
    const hasStats = false; // e.g. controller without $listStats
    const page = PageSchema.make()
      .title("Companies")
      .headerActions((a) =>
        a.button({ label: "Neu", href: "/companies/create", icon: "plus" }),
      )
      .schema([
        hasStats && <div>stats-here</div>,
        Section.make("Liste").schema([<div>table-here</div>]),
      ])
      .build();

    render(<TablefyPage schema={page} />);

    expect(screen.getByRole("heading", { level: 1, name: "Companies" })).toBeInTheDocument();
    expect(screen.getByText("Neu")).toBeInTheDocument();
    expect(screen.getByText("table-here")).toBeInTheDocument();
    // The `false` schema item must not crash and must render nothing.
    expect(screen.queryByText("stats-here")).not.toBeInTheDocument();
  });
});
