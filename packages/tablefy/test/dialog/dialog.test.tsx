import { render, screen, act } from "@testing-library/react";
import { dialog } from "../../src/dialog/dialog";
import { getDialogs, closeDialog } from "../../src/dialog/store";
import { TablefyDialogs } from "../../src/dialog/TablefyDialogs";

function clear() {
  while (getDialogs().length) closeDialog();
}

describe("dialog engine", () => {
  beforeEach(clear);

  it("confirm() pushes a confirm dialog and resolves with the choice", async () => {
    const p = dialog.confirm({ title: "Sicher?" });
    const items = getDialogs();
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("confirm");

    // Simulate the user confirming.
    (items[0] as { resolve: (v: boolean) => void }).resolve(true);
    closeDialog(items[0].id);

    await expect(p).resolves.toBe(true);
    expect(getDialogs()).toHaveLength(0);
  });

  it("form() pushes a form dialog; close() removes it", () => {
    const id = dialog.form({
      schema: { fields: [], config: {} } as never,
      url: "/companies",
    });
    expect(getDialogs().some((d) => d.id === id)).toBe(true);
    dialog.close(id);
    expect(getDialogs().some((d) => d.id === id)).toBe(false);
  });

  it("<TablefyDialogs/> renders a confirm dialog's title", () => {
    render(<TablefyDialogs />);
    act(() => {
      void dialog.confirm({ title: "Wirklich löschen?" });
    });
    expect(screen.getByText("Wirklich löschen?")).toBeInTheDocument();
  });
});
