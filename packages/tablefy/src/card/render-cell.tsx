import { ReactNode } from "react";
import { getByPath } from "../kanban/utils";
import { CardCell } from "./types";

/**
 * Render a table column's value standalone (no TanStack table) for one record,
 * by invoking the column's `cell` with a minimal context. Works for the common
 * display columns (text/badge/number/date/progress/boolean/enum/link/icon/…).
 */
export function renderCellValue(cell: CardCell, record: any): ReactNode {
  const def = cell.build();
  const accessor = cell.getAccessor();
  const getValue = () => getByPath(record, accessor);
  const context = {
    getValue,
    renderValue: getValue,
    row: { original: record, getValue },
    column: { id: accessor },
    table: {},
  } as any;
  return typeof def.cell === "function"
    ? (def.cell(context) as ReactNode)
    : (getValue() as ReactNode);
}
