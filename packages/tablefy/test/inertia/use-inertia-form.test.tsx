import { renderHook, act } from "@testing-library/react";
import { useInertiaForm } from "../../src/inertia/use-inertia-form";
import { FormSchema, TextInput } from "../../src/forms";

const schema = FormSchema.make<any>()
  .schema([TextInput.make("name"), TextInput.make("email").email()])
  .build();

describe("useInertiaForm", () => {
  it("derives default values from the schema fields", () => {
    const { result } = renderHook(() => useInertiaForm({ schema, url: "/x" }));
    expect(result.current.data).toEqual({ name: "", email: "" });
  });

  it("onChange updates a single field", () => {
    const { result } = renderHook(() => useInertiaForm({ schema, url: "/x" }));
    act(() => result.current.onChange("name", "Jane"));
    expect(result.current.data.name).toBe("Jane");
  });

  it("merges initialData over schema defaults", () => {
    const { result } = renderHook(() =>
      useInertiaForm({ schema, url: "/x", initialData: { name: "Bob" } }),
    );
    expect(result.current.data.name).toBe("Bob");
  });
});
