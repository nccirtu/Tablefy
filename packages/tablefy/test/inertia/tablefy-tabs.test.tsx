import { render, screen } from "@testing-library/react";
import { TablefyTabs } from "../../src/inertia/tablefy-tabs";
import { router, __setPageProps } from "../mocks/inertia";

describe("TablefyTabs", () => {
  beforeEach(() => {
    __setPageProps({});
    (router.reload as jest.Mock).mockClear();
  });

  it("renders a normal (non-lazy) tab's content", () => {
    render(
      <TablefyTabs
        tabs={[{ value: "details", label: "Details", content: <div>Detail body</div> }]}
      />,
    );
    expect(screen.getByText("Detail body")).toBeInTheDocument();
  });

  it("requests a lazy prop and shows a skeleton until it loads", () => {
    render(
      <TablefyTabs
        tabs={[
          { value: "details", label: "Details", content: <div>Details</div> },
          {
            value: "posts",
            label: "Posts",
            lazy: "posts",
            content: (data) => <div>posts: {(data as unknown[]).length}</div>,
          },
        ]}
      />,
    );
    // Optional prop not loaded yet → reload requested for exactly that prop.
    expect(router.reload).toHaveBeenCalledWith({ only: ["posts"] });
    expect(screen.queryByText(/posts:/)).not.toBeInTheDocument();
  });

  it("renders the loaded prop without re-requesting it", () => {
    __setPageProps({ posts: [{ id: 1 }, { id: 2 }] });
    render(
      <TablefyTabs
        tabs={[
          {
            value: "posts",
            label: "Posts",
            lazy: "posts",
            content: (data) => <div>posts: {(data as unknown[]).length}</div>,
          },
        ]}
      />,
    );
    expect(screen.getByText("posts: 2")).toBeInTheDocument();
    expect(router.reload).not.toHaveBeenCalled();
  });
});
