# Usage Guide

Complete guide to using Tablefy in your React projects.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Column Types](#column-types)
- [Advanced Features](#advanced-features)
- [Configuration](#configuration)
- [Examples](#examples)

## Basic Usage

### Creating a Simple Table

```tsx
import { DataTable, TableSchema, TextColumn } from "tablefy";

type User = {
  id: string;
  name: string;
  email: string;
};

const columns = TableSchema.make<User>()
  .columns(
    TextColumn.make("name").label("Name").sortable(),
    TextColumn.make("email").label("Email"),
  )
  .build();

function UsersTable({ users }: { users: User[] }) {
  return <DataTable columns={columns} data={users} />;
}
```

## Column Types

Tablefy provides 12+ specialized column types with fluent builder APIs.

### TextColumn

Display simple text with formatting options.

**Methods:**

- `label(text)` - Set column header
- `sortable()` - Enable sorting
- `prefix(text)` - Add prefix to value
- `suffix(text)` - Add suffix to value
- `limit(chars)` - Truncate text
- `uppercase()` - Transform to uppercase
- `lowercase()` - Transform to lowercase
- `capitalize()` - Capitalize first letter

**Example:**

```tsx
TextColumn.make("name").label("Full Name").sortable().capitalize();

TextColumn.make("code").label("Product Code").prefix("SKU-").uppercase();

TextColumn.make("description").label("Description").limit(50);
```

### NumberColumn

Format numbers, currency, and percentages.

**Methods:**

- `label(text)` - Set column header
- `sortable()` - Enable sorting
- `money(currency?)` - Format as currency (default: USD)
- `percent(decimals?)` - Format as percentage
- `decimals(count)` - Set decimal places
- `locale(locale)` - Set number locale
- `compact()` - Use compact notation (1K, 1M)

**Example:**

```tsx
NumberColumn.make("price").label("Price").sortable().money("EUR").decimals(2);

NumberColumn.make("discount").label("Discount").percent(1);

NumberColumn.make("views").label("Views").compact().locale("de-DE");
```

### DateColumn

Display and format dates and times.

**Methods:**

- `label(text)` - Set column header
- `sortable()` - Enable sorting
- `short()` - Short date format (MM/DD/YYYY)
- `long()` - Long date format (Month DD, YYYY)
- `relative()` - Relative time (2 hours ago)
- `datetime()` - Date and time
- `time()` - Time only
- `withIcon()` - Show calendar icon
- `format(formatString)` - Custom format

**Example:**

```tsx
DateColumn.make("createdAt").label("Created").sortable().relative();

DateColumn.make("deadline").label("Due Date").long().withIcon();

DateColumn.make("lastLogin").label("Last Login").datetime();
```

### BadgeColumn

Display status badges with variants.

**Methods:**

- `label(text)` - Set column header
- `sortable()` - Enable sorting
- `variants(mapping)` - Map values to badge variants
- `boolean(options)` - Boolean badge (true/false)
- `status()` - Preset for status values
- `priority()` - Preset for priority values

**Example:**

```tsx
BadgeColumn.make("status").label("Status").variants({
  active: "success",
  pending: "warning",
  inactive: "secondary",
  error: "destructive",
});

BadgeColumn.make("isVerified").label("Verified").boolean({
  trueLabel: "Verified",
  falseLabel: "Unverified",
  trueVariant: "success",
  falseVariant: "secondary",
});

BadgeColumn.make("priority").label("Priority").priority(); // low, medium, high, critical
```

### LinkColumn

Create clickable links.

**Methods:**

- `label(text)` - Set column header
- `sortable()` - Enable sorting
- `href(urlOrFn)` - Set link URL
- `external()` - Open in new tab
- `underline(when?)` - Underline style (always, hover, never)
- `openInNewTab()` - Open in new tab
- `limit(chars)` - Truncate link text

**Example:**

```tsx
LinkColumn.make("name")
  .label("Project")
  .href((row) => `/projects/${row.id}`)
  .underline("hover");

LinkColumn.make("website").label("Website").external().limit(30);

LinkColumn.make("email")
  .label("Email")
  .href((row) => `mailto:${row.email}`);
```

### ProgressColumn

Display progress bars.

**Methods:**

- `label(text)` - Set column header
- `sortable()` - Enable sorting
- `max(value)` - Set maximum value
- `colorByThreshold(warning, danger)` - Auto color by value
- `showPercentage()` - Show percentage text
- `format(fn)` - Custom format function
- `size(size)` - Bar size (sm, md, lg)

**Example:**

```tsx
ProgressColumn.make("progress")
  .label("Progress")
  .sortable()
  .colorByThreshold(30, 15) // warning <30%, danger <15%
  .showPercentage();

ProgressColumn.make("completion").label("Completion").max(100).size("lg");
```

### AvatarGroupColumn

Display groups of avatars.

**Methods:**

- `label(text)` - Set column header
- `maxVisible(count)` - Max avatars to show
- `size(size)` - Avatar size (xs, sm, md, lg)
- `overlap(amount)` - Overlap amount
- `fields(mapping)` - Map data fields
- `showNames()` - Show names on hover

**Example:**

```tsx
AvatarGroupColumn.make("team")
  .label("Team Members")
  .maxVisible(3)
  .size("sm")
  .fields({ name: "name", src: "avatar" })
  .showNames();

AvatarGroupColumn.make("assignees")
  .label("Assigned To")
  .maxVisible(5)
  .overlap(0.5);
```

### IconColumn

Display status icons.

**Methods:**

- `label(text)` - Set column header
- `sortable()` - Enable sorting
- `boolean(options)` - Boolean icon
- `priority()` - Priority preset (low/medium/high/critical)
- `onlineStatus()` - Online/offline preset
- `verification()` - Verified/unverified preset
- `states(mapping)` - Custom state mapping
- `withBackground()` - Show background
- `showLabel()` - Show text label

**Example:**

```tsx
IconColumn.make("priority").label("Priority").priority().withBackground();

IconColumn.make("isOnline").label("Status").onlineStatus();

IconColumn.make("status")
  .label("Status")
  .states({
    active: { icon: "check", color: "green" },
    inactive: { icon: "x", color: "gray" },
  })
  .showLabel();
```

### ImageColumn

Display single images.

**Methods:**

- `label(text)` - Set column header
- `size(size)` - Image size (sm, md, lg, xl)
- `rounded(amount)` - Border radius
- `circular()` - Circular image
- `fallback(url)` - Fallback image URL
- `alt(text)` - Alt text

**Example:**

```tsx
ImageColumn.make("avatar")
  .label("Avatar")
  .size("md")
  .circular()
  .fallback("/default-avatar.png");

ImageColumn.make("thumbnail").label("Preview").size("lg").rounded("md");
```

### CheckboxColumn

Selection checkboxes.

**Example:**

```tsx
CheckboxColumn.make();
```

### ActionsColumn

Dropdown menu with actions.

**Methods:**

- `view(handler)` - Add view action
- `edit(handler)` - Add edit action
- `delete(handler)` - Add delete action
- `action(label, handler, icon?)` - Add custom action
- `link(label, href, icon?)` - Add link action
- `separator()` - Add separator

**Example:**

```tsx
ActionsColumn.make<Project>()
  .view((row) => navigate(`/projects/${row.id}`))
  .edit((row) => openEditModal(row))
  .separator()
  .action("Duplicate", (row) => duplicate(row), "copy")
  .action("Archive", (row) => archive(row), "archive")
  .separator()
  .delete((row) => deleteProject(row));
```

## Advanced Features

### Search Configuration

```tsx
<DataTable
  columns={columns}
  data={data}
  config={{
    search: {
      enabled: true,
      placeholder: "Search...",
      columns: ["name", "email"], // Columns to search
      debounce: 300, // Debounce delay in ms
    },
  }}
/>
```

### Filters

```tsx
<DataTable
  columns={columns}
  data={data}
  config={{
    filters: [
      {
        id: "status",
        label: "Status",
        type: "select",
        column: "status",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
      {
        id: "dateRange",
        label: "Date Range",
        type: "date-range",
        column: "createdAt",
      },
    ],
  }}
/>
```

### Pagination

```tsx
<DataTable
  columns={columns}
  data={data}
  config={{
    pagination: {
      enabled: true,
      pageSize: 10,
      pageSizeOptions: [10, 25, 50, 100],
      showPageInfo: true,
      showPageSizeSelector: true,
    },
  }}
/>
```

### Empty States

```tsx
import { EmptyStateBuilder } from "tablefy";

const emptyState = EmptyStateBuilder.make()
  .title("No data found")
  .description("Try adjusting your filters")
  .action("Reset Filters", () => resetFilters())
  .build();

<DataTable
  columns={columns}
  data={data}
  config={{
    emptyState: emptyState,
  }}
/>;
```

### Header Actions

```tsx
<DataTable
  columns={columns}
  data={data}
  config={{
    headerActions: [
      {
        id: "create",
        label: "Create New",
        icon: <Plus />,
        onClick: () => openCreateModal(),
      },
      {
        id: "export",
        label: "Export",
        icon: <Download />,
        onClick: () => exportData(),
      },
    ],
  }}
/>
```

## Configuration

### Complete Config Example

```tsx
const config: DataTableConfig<User> = {
  // Header
  title: 'Users',
  description: 'Manage your users',
  headerActions: [...],

  // Empty States
  emptyState: EmptyStateBuilder.make().noData().build(),
  searchEmptyState: EmptyStateBuilder.make().noSearchResults().build(),
  filterEmptyState: EmptyStateBuilder.make().noFilterResults().build(),

  // Features
  search: { enabled: true },
  filters: [...],
  pagination: { enabled: true, pageSize: 25 },

  // Selection
  enableRowSelection: true,
  enableMultiRowSelection: true,

  // Sorting
  enableSorting: true,
  defaultSort: { id: 'name', desc: false },

  // Visibility
  enableColumnVisibility: true,

  // Density
  density: 'default', // compact | default | comfortable

  // Styling
  bordered: true,
  striped: false,
  hoverable: true
};
```

## Examples

### E-Commerce Products Table

```tsx
type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  status: "active" | "draft" | "archived";
};

const columns = TableSchema.make<Product>()
  .columns(
    CheckboxColumn.make(),

    ImageColumn.make("image").label("Image").size("sm").rounded("md"),

    TextColumn.make("name").label("Product").sortable(),

    TextColumn.make("sku").label("SKU").prefix("SKU-").uppercase(),

    NumberColumn.make("price").label("Price").sortable().money("USD"),

    NumberColumn.make("stock").label("Stock").sortable(),

    BadgeColumn.make("status").label("Status").status(),

    ActionsColumn.make<Product>()
      .view((row) => navigate(`/products/${row.id}`))
      .edit((row) => openEditModal(row))
      .delete((row) => deleteProduct(row)),
  )
  .build();
```

### Team Members Table

```tsx
type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  isOnline: boolean;
  lastActive: Date;
  projects: Array<{ name: string; avatar: string }>;
};

const columns = TableSchema.make<TeamMember>()
  .columns(
    ImageColumn.make("avatar").label("Avatar").circular().size("md"),

    TextColumn.make("name").label("Name").sortable(),

    LinkColumn.make("email")
      .label("Email")
      .href((row) => `mailto:${row.email}`),

    BadgeColumn.make("role").label("Role").variants({
      admin: "destructive",
      manager: "default",
      member: "secondary",
    }),

    IconColumn.make("isOnline").label("Status").onlineStatus(),

    DateColumn.make("lastActive").label("Last Active").relative(),

    AvatarGroupColumn.make("projects")
      .label("Projects")
      .maxVisible(3)
      .fields({ name: "name", src: "avatar" }),
  )
  .build();
```

For more examples and advanced use cases, check the [GitHub repository](https://github.com/nccirtu/Tablefy).

## Forms

Tablefy also includes a complete schema-driven form system. See the dedicated guides:

- [Forms Guide](./FORMS.md) - All 11 field types, layouts (sections, tabs, wizard), field dependencies, and full examples
- [Inertia Integration](./INERTIA.md) - `useInertiaForm`, `useServerTable`, Precognition, and Laravel controller examples

**Quick example:**

```tsx
import { FormSchema, TextInput, Select, FormRenderer } from "@nccirtu/tablefy/forms";

const schema = FormSchema.make<CreateUser>()
  .title("Create User")
  .columns(2)
  .fields(
    TextInput.make<CreateUser>("name").label("Name").required(),
    TextInput.make<CreateUser>("email").label("Email").email().required(),
    Select.make<CreateUser>("role")
      .label("Role")
      .options([
        { value: "admin", label: "Admin" },
        { value: "editor", label: "Editor" },
      ]),
  )
  .actions((a) => a.submit({ label: "Create" }))
  .build();
```

