export { DataTable } from "./tablefy/data-table";
export { DataTableSchema } from "./tablefy/data-table-schema";

// Stats (backend-computed numbers, frontend-rendered cards with skeletons)
export { TablefyStats, StatCard } from "./tablefy/stats";
export type { TablefyStatsProps } from "./tablefy/stats";

// Schema renderer (Grid/Section/JSX layout, no page chrome — usable anywhere)
export { TablefySchema, SchemaRenderer } from "./tablefy/schema-content";
export type { TablefySchemaProps } from "./tablefy/schema-content";

// Render hooks (named slots for injecting content)
export {
  registerTablefyRenderHook,
  getTablefyRenderHooks,
} from "./render-hooks";
export type {
  TablefyRenderHook,
  TablefyHookName,
  TablefyHookContext,
  TablefyHookRender,
} from "./render-hooks";
export { RenderHook } from "./components/render-hook";
export type { RenderHookProps } from "./components/render-hook";

// Skeleton primitive (loading states)
export { Skeleton } from "./components/ui/skeleton";

// Button primitive (handy for custom actions, relation managers, etc.)
export { Button } from "./components/ui/button";

// Page schema (nested layout components)
export {
  PageSchema,
  PageActionsBuilder,
  Grid,
  Section,
  isSchemaNode,
} from "./schema";
export type {
  PageConfig,
  PageBuildResult,
  PageAction,
  PageFormConfig,
  PageBreadcrumb,
  SchemaNode,
  SchemaItem,
} from "./schema";

// Builders
export { TableSchema, EmptyStateBuilder, Stats } from "./builders";

// Filter builders
export {
  SelectFilter,
  TernaryFilter,
  TextFilter,
  DateFilter,
} from "./builders";

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

export {
  ActionsColumn,
  ActionsColumn as actionsColumn,
} from "./columns/actions-column";
export type {
  ActionItem,
  ActionFormConfig,
  ActionDialogConfig,
} from "./columns/actions-column";

export { TextColumn, TextColumn as textColumn } from "./columns/text-column";

export { EnumColumn, EnumColumn as enumColumn } from "./columns/enum-column";
export type { EnumOption } from "./columns/enum-column";

// Confirm utilities
export { ConfirmProvider, confirm } from "./confirm";
export type { ConfirmOptions } from "./confirm";

// Dialog engine (imperative confirm/form/custom modals; mount <TablefyDialogs/>)
export { dialog, TablefyDialogs } from "./dialog";
export type {
  FormDialogOptions,
  CustomDialogOptions,
  FormSchemaInput,
} from "./dialog";

// Types
export type {
  DataTableConfig,
  EmptyStateConfig,
  FilterConfig,
  HeaderAction,
  PaginationConfig,
  SearchConfig,
  BulkAction,
  StatColor,
  StatTrend,
  StatTrendDirection,
  StatData,
  StatGroupData,
  StatCardRenderer,
  StatsConfig,
} from "./types";

// Forms - re-export for convenience
export {
  FormSchema,
  ActionsBuilder,
  SectionBuilder,
  TabBuilder,
  WizardStep,
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Toggle,
  RadioGroup,
  DatePicker,
  Hidden,
  FileUpload,
  CheckboxGroup,
  Repeater,
  FormRenderer,
} from "./forms";

export type {
  FormSchemaConfig,
  FormBuildResult,
  FormRendererProps,
  BuiltField,
  FieldType,
  FieldRenderProps,
  BaseFieldConfig,
  SelectOption as FormSelectOption,
  FormActionConfig,
  SectionConfig,
  TabConfig,
  WizardStepConfig,
} from "./forms";
