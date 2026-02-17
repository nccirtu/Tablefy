import { router } from "@inertiajs/react";
import { useState, useCallback, useRef } from "react";
import {
  ServerTableConfig,
  ServerTableState,
  ServerTableReturn,
} from "./types";

export function useServerTable(config: ServerTableConfig): ServerTableReturn {
  const {
    url,
    defaultSort = null,
    defaultPageSize = 15,
    debounce = 300,
    preserveState = true,
    preserveScroll = true,
    only,
  } = config;

  const [state, setState] = useState<ServerTableState>({
    search: "",
    sort: defaultSort,
    page: 1,
    perPage: defaultPageSize,
    filters: {},
  });

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visitWithState = useCallback(
    (newState: ServerTableState) => {
      const params: Record<string, any> = {};

      if (newState.search) params.search = newState.search;
      if (newState.sort) {
        params.sort = newState.sort.id;
        params.direction = newState.sort.desc ? "desc" : "asc";
      }
      params.page = newState.page;
      params.per_page = newState.perPage;

      for (const [key, value] of Object.entries(newState.filters)) {
        if (value !== null && value !== undefined && value !== "") {
          params[`filter[${key}]`] = value;
        }
      }

      router.visit(url, {
        data: params,
        preserveState,
        preserveScroll,
        only,
        replace: true,
      });
    },
    [url, preserveState, preserveScroll, only],
  );

  const setSearch = useCallback(
    (search: string) => {
      const newState = { ...state, search, page: 1 };
      setState(newState);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(
        () => visitWithState(newState),
        debounce,
      );
    },
    [state, debounce, visitWithState],
  );

  const setSort = useCallback(
    (sort: { id: string; desc: boolean } | null) => {
      const newState = { ...state, sort };
      setState(newState);
      visitWithState(newState);
    },
    [state, visitWithState],
  );

  const setPage = useCallback(
    (page: number) => {
      const newState = { ...state, page };
      setState(newState);
      visitWithState(newState);
    },
    [state, visitWithState],
  );

  const setPerPage = useCallback(
    (perPage: number) => {
      const newState = { ...state, perPage, page: 1 };
      setState(newState);
      visitWithState(newState);
    },
    [state, visitWithState],
  );

  const setFilter = useCallback(
    (key: string, value: any) => {
      const newState = {
        ...state,
        filters: { ...state.filters, [key]: value },
        page: 1,
      };
      setState(newState);
      visitWithState(newState);
    },
    [state, visitWithState],
  );

  const resetFilters = useCallback(() => {
    const newState = { ...state, filters: {}, page: 1 };
    setState(newState);
    visitWithState(newState);
  }, [state, visitWithState]);

  return {
    state,
    setSearch,
    setSort,
    setPage,
    setPerPage,
    setFilter,
    resetFilters,
  };
}
