import { renderHook, act } from "@testing-library/react";
import { useServerTable } from "../../src/inertia/use-server-table";
import { router } from "../mocks/inertia";

const lastVisit = () =>
  (router.visit as jest.Mock).mock.calls.at(-1) as [string, any];

describe("useServerTable", () => {
  it("setSort visits with sort + direction", () => {
    const { result } = renderHook(() => useServerTable({ url: "/customers" }));
    act(() => result.current.setSort({ id: "name", desc: true }));

    const [url, opts] = lastVisit();
    expect(url).toBe("/customers");
    expect(opts.data).toMatchObject({ sort: "name", direction: "desc" });
  });

  it("setPerPage resets to page 1", () => {
    const { result } = renderHook(() =>
      useServerTable({ url: "/x", defaultPageSize: 15 }),
    );
    act(() => result.current.setPage(3));
    act(() => result.current.setPerPage(50));

    const [, opts] = lastVisit();
    expect(opts.data.per_page).toBe(50);
    expect(opts.data.page).toBe(1);
  });

  it("setFilter adds filter[key]", () => {
    const { result } = renderHook(() => useServerTable({ url: "/x" }));
    act(() => result.current.setFilter("status", "active"));

    expect(lastVisit()[1].data["filter[status]"]).toBe("active");
  });

  it("resetFilters removes filter params", () => {
    const { result } = renderHook(() => useServerTable({ url: "/x" }));
    act(() => result.current.setFilter("status", "active"));
    act(() => result.current.resetFilters());

    expect(lastVisit()[1].data["filter[status]"]).toBeUndefined();
  });

  it("setSearch is debounced, then visits with search + page 1", () => {
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      useServerTable({ url: "/x", debounce: 300 }),
    );

    act(() => result.current.setSearch("john"));
    expect(router.visit).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(300));
    const [, opts] = lastVisit();
    expect(opts.data).toMatchObject({ search: "john", page: 1 });

    jest.useRealTimers();
  });
});
