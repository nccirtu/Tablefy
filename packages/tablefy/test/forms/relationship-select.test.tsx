import { render, screen } from "@testing-library/react";
import { FormRenderer } from "../../src/forms/components/form-renderer";
import { FormSchema, Select } from "../../src/forms";

describe("relationship Select.optionsFrom", () => {
  it("resolves its options from the external page props", () => {
    const schema = FormSchema.make<{ company_id: string }>()
      .fields(
        Select.make<{ company_id: string }>("company_id")
          .label("Company")
          .optionsFrom("companyOptions"),
      )
      .build();

    render(
      <FormRenderer
        schema={schema}
        data={{ company_id: "" }}
        errors={{}}
        onChange={() => {}}
        onSubmit={() => {}}
        external={{
          companyOptions: [
            { value: "1", label: "Acme" },
            { value: "2", label: "Globex" },
          ],
        }}
      />,
    );

    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Globex")).toBeInTheDocument();
  });
});
