import { render, screen } from "@testing-library/react";
import { TablefySchema } from "../../src/tablefy/schema-content";
import { Grid, Section } from "../../src/schema";

describe("TablefySchema", () => {
  it("renders nested Section + Grid + JSX leaves (schema-driven tab content)", () => {
    render(
      <TablefySchema
        schema={[
          Section.make("Stammdaten").schema([
            Grid.make(2).schema([
              <div>leaf-a</div>,
              <div>leaf-b</div>,
            ]),
          ]),
        ]}
      />,
    );
    expect(screen.getByText("Stammdaten")).toBeInTheDocument();
    expect(screen.getByText("leaf-a")).toBeInTheDocument();
    expect(screen.getByText("leaf-b")).toBeInTheDocument();
  });

  it("skips falsy items without crashing", () => {
    render(
      <TablefySchema schema={[false, null, <div>only-this</div>]} />,
    );
    expect(screen.getByText("only-this")).toBeInTheDocument();
  });
});
