// Main components - from tablefy folder (our components)
export { DataTable } from "./tablefy/data-table";
export { DataTableSchema } from "./tablefy/data-table-schema";

// Builders
export { TableSchema, EmptyStateBuilder } from "./lib/builders";

// Columns - export with both PascalCase and camelCase for flexibility
export {
  AvatarGroupColumn,
  AvatarGroupColumn as avatarGroupColumn,
} from "./columns/avatar-group-column";

export {
  BadgeColumn,
  BadgeColumn as badgeColumn,
} from "./columns/badge-column";

export {
  ButtonColumn,
  ButtonColumn as buttonColumn,
} from "./columns/button-column";

export {
  CheckboxColumn,
  CheckboxColumn as checkboxColumn,
} from "./columns/checkbox-column";

export { DateColumn, DateColumn as dateColumn } from "./columns/date-column";

export {
  DropdownColumn,
  DropdownColumn as dropdownColumn,
} from "./columns/dropdown-column";

export { IconColumn, IconColumn as iconColumn } from "./columns/icon-column";

export { ImageColumn } from "./columns/image-column";

export {
  InputColumn,
  InputColumn as inputColumn,
} from "./columns/input-column";

export { LinkColumn } from "./columns/link-column";

export { NumberColumn } from "./columns/number-column";

export {
  ProgressColumn,
  ProgressColumn as progressColumn,
} from "./columns/progress-column";

export {
  SelectColumn,
  SelectColumn as selectColumn,
} from "./columns/select-column";

export { TextColumn, TextColumn as textColumn } from "./columns/text-column";

export { ActionsColumn } from "./columns/actions-column";

// Types
export type {
  DataTableConfig,
  EmptyStateConfig,
  FilterConfig,
  HeaderAction,
  PaginationConfig,
  SearchConfig,
} from "./lib/types";
