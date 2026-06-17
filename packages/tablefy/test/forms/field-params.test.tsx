import { renderHook, act } from "@testing-library/react";
import { FormSchema, TextInput, Select } from "../../src/forms";
import { useInertiaForm } from "../../src/inertia/use-inertia-form";
import { __getLastSubmit } from "../mocks/inertia";

describe("field params — builder config", () => {
  it("stores the new general parameters on the config", () => {
    const fn = () => true;
    const after = () => {};
    const built = TextInput.make<any>("name")
      .required(fn)
      .readOnly(fn)
      .hiddenOn("create")
      .visibleOn(["create", "edit"])
      .disabledOn("edit")
      .hint("h")
      .tooltip("t")
      .autofocus()
      .columnSpanFull()
      .dehydrated(false)
      .live({ debounce: 300 })
      .afterStateUpdated(after)
      .build();

    expect(built.config.required).toBe(fn);
    expect(built.config.readOnly).toBe(fn);
    expect(built.config.hiddenOn).toEqual(["create"]);
    expect(built.config.visibleOn).toEqual(["create", "edit"]);
    expect(built.config.disabledOn).toEqual(["edit"]);
    expect(built.config.hint).toBe("h");
    expect(built.config.tooltip).toBe("t");
    expect(built.config.autofocus).toBe(true);
    expect(built.config.columnSpanFull).toBe(true);
    expect(built.config.dehydrated).toBe(false);
    expect(built.config.reactive).toBe(true);
    expect(built.config.debounce).toBe(300);
    expect(built.config.afterStateUpdated).toBe(after);
  });

  it("required(true) still adds a required rule; required(fn) does not", () => {
    const withRule = TextInput.make<any>("a").required().build();
    expect(withRule.config.rules?.some((r) => r.type === "required")).toBe(true);

    const conditional = TextInput.make<any>("b")
      .required(() => true)
      .build();
    expect(conditional.config.rules?.some((r) => r.type === "required")).toBe(
      false,
    );
  });
});

describe("field params — submit / hydration", () => {
  it("formatStateUsing transforms the hydrated value", () => {
    const schema = FormSchema.make<any>()
      .fields(
        TextInput.make("price").formatStateUsing((v) => Number(v).toFixed(2)),
      )
      .build();

    const { result } = renderHook(() =>
      useInertiaForm({ schema, url: "/x", initialData: { price: 5 } }),
    );
    expect(result.current.data.price).toBe("5.00");
  });

  it("dehydrated(false) drops the field and mutateBeforeSave transforms it", () => {
    const schema = FormSchema.make<any>()
      .fields(
        TextInput.make("name").mutateBeforeSave((v) =>
          typeof v === "string" ? v.trim() : v,
        ),
        Select.make("ui").dehydrated(false),
      )
      .build();

    const { result } = renderHook(() => useInertiaForm({ schema, url: "/x" }));
    act(() => {
      result.current.onChange("name", "  Jane  ");
      result.current.onChange("ui", "scratch");
    });
    act(() => result.current.onSubmit());

    expect(__getLastSubmit()).toEqual({ name: "Jane" });
  });
});
