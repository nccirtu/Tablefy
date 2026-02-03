export { DataTable } from "./tablefy/data-table";
export { DataTableSchema } from "./tablefy/data-table-schema";

// Builders
export { TableSchema, EmptyStateBuilder } from "./builders";

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

export { ProgressColumn, SelectColumn } from "./columns";

export { EnumColumn, EnumColumn as enumColumn } from "./columns/enum-column";
export type { EnumOption } from "./columns/enum-column";

// Confirm utilities
export { ConfirmProvider, confirm } from "./confirm";
export type { ConfirmOptions } from "./confirm";

// Types
export type {
  DataTableConfig,
  EmptyStateConfig,
  FilterConfig,
  HeaderAction,
  PaginationConfig,
  SearchConfig,
} from "./types";
