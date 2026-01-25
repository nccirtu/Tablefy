# Tablefy

A powerful, type-safe React table package built with TanStack Table and shadcn/ui components. Create beautiful, feature-rich data tables with a fluent, chainable API.

## Features

- **Beautiful UI** - Built on shadcn/ui components with Tailwind CSS
- **Search & Filter** - Built-in search and advanced filtering
- **Sorting & Pagination** - Full sorting and pagination support
- **Type-Safe** - Complete TypeScript support with type inference
- **Fluent API** - Chainable builder pattern for easy configuration
- **Responsive** - Mobile-friendly responsive design
- **Rich Columns** - 12+ specialized column types with custom builders
- **Performance** - Optimized for large datasets
- **Customizable** - Extensive theming and styling options

## Installation

```bash
npm install @nccirtu/tablefy
```

**⚠️ Important:** Tablefy requires additional setup steps to work correctly.

### Two Ways to Use Tablefy

Tablefy offers **two approaches** to fit your workflow:

#### 🚀 **Quick Start (Direct Import)**

Import components directly from the package - perfect for getting started quickly:

```tsx
import { DataTable, TableSchema, TextColumn } from "@nccirtu/tablefy";
```

✅ **Pros:** Zero setup, works immediately after installation  
❌ **Cons:** Limited customization of internal components

#### 🛠️ **Full Control (CLI Installation)**

Copy components to your project for complete customization:

```bash
npx tablefy init
```

This copies all components to your `components/tablefy/` directory, allowing you to:

- Customize styles and behavior
- Modify internal components
- Full control over the code

✅ **Pros:** Complete customization freedom  
❌ **Cons:** Requires CLI setup step

**Choose the approach that fits your needs!** Most users start with direct imports and switch to CLI installation when they need customization.

### What you need to install

1. **Peer dependencies** (required libraries)
2. **shadcn/ui components** (UI building blocks)
3. **Tailwind configuration** (for styling)

👉 **[Follow the complete installation guide →](./INSTALLATION.md)**

### Quick Overview

```bash
# 1. Install dependencies
npm install @tanstack/react-table lucide-react class-variance-authority clsx tailwind-merge

# 2. Install shadcn components
npx shadcn@latest add button table checkbox dropdown-menu input select badge progress tooltip

# 3. Configure Tailwind (see INSTALLATION.md for framework-specific instructions)

# 4. For Laravel/Vite: Add alias configuration to vite.config.js
# See INSTALLATION.md Step 6 for details

# 5. Restart dev server
```

**Laravel/Vite Users:** You must configure the `@` alias in your `vite.config.js` to resolve imports correctly. See [INSTALLATION.md](./INSTALLATION.md#step-6-configure-vite-laravelvite-projects) for details.

## Quick Start

```tsx
import {
  DataTable,
  TableSchema,
  TextColumn,
  BadgeColumn,
  DateColumn,
} from "tablefy";

type User = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  createdAt: Date;
};

const columns = TableSchema.make<User>()
  .columns(
    TextColumn.make("name").label("Name").sortable(),

    TextColumn.make("email").label("Email").limit(30),

    BadgeColumn.make("status").label("Status").variants({
      active: "success",
      inactive: "secondary",
    }),

    DateColumn.make("createdAt").label("Created").relative(),
  )
  .build();

function UsersTable({ users }: { users: User[] }) {
  return (
    <DataTable
      columns={columns}
      data={users}
      config={{
        search: { enabled: true },
        pagination: { enabled: true },
      }}
    />
  );
}
```

## Column Types

Tablefy provides 12+ specialized column types, each with their own builder methods:

| Column Type         | Description          | Key Methods                                                               |
| ------------------- | -------------------- | ------------------------------------------------------------------------- |
| `TextColumn`        | Simple text display  | `sortable()`, `prefix()`, `suffix()`, `limit()`, `uppercase()`            |
| `NumberColumn`      | Numbers & currency   | `money()`, `percent()`, `decimals()`, `locale()`                          |
| `DateColumn`        | Dates & times        | `short()`, `long()`, `relative()`, `datetime()`, `withIcon()`             |
| `BadgeColumn`       | Status badges        | `variants()`, `boolean()`, `status()`                                     |
| `LinkColumn`        | Clickable links      | `href()`, `external()`, `underline()`, `openInNewTab()`                   |
| `ProgressColumn`    | Progress bars        | `max()`, `colorByThreshold()`, `showPercentage()`, `format()`             |
| `AvatarGroupColumn` | Avatar groups        | `maxVisible()`, `size()`, `overlap()`, `fields()`, `showNames()`          |
| `IconColumn`        | Status icons         | `boolean()`, `priority()`, `onlineStatus()`, `verification()`, `states()` |
| `ImageColumn`       | Single images        | `size()`, `rounded()`, `circular()`, `fallback()`                         |
| `CheckboxColumn`    | Selection checkboxes | —                                                                         |
| `ActionsColumn`     | Dropdown menus       | `view()`, `edit()`, `delete()`, `action()`, `link()`                      |

## Example: Project Management Table

```tsx
import {
  TableSchema,
  CheckboxColumn,
  TextColumn,
  LinkColumn,
  ProgressColumn,
  AvatarGroupColumn,
  IconColumn,
  DateColumn,
  ActionsColumn,
} from "tablefy";

type Project = {
  id: string;
  name: string;
  url: string;
  progress: number;
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "inactive";
  isPublic: boolean;
  team: Array<{ name: string; avatar?: string }>;
  deadline: Date;
};

export const projectColumns = TableSchema.make<Project>()
  .columns(
    CheckboxColumn.make(),

    LinkColumn.make("name")
      .label("Project")
      .sortable()
      .href((row) => `/projects/${row.id}`)
      .underline("hover"),

    LinkColumn.make("url").label("Website").external().limit(30),

    ProgressColumn.make("progress")
      .label("Progress")
      .sortable()
      .colorByThreshold(30, 15)
      .showPercentage(),

    IconColumn.make("priority")
      .label("Priority")
      .sortable()
      .priority()
      .withBackground(),

    IconColumn.make("status").label("Status").activeInactive(),

    IconColumn.make("isPublic")
      .label("Visibility")
      .boolean({
        trueLabel: "Public",
        falseLabel: "Private",
      })
      .showLabel(),

    AvatarGroupColumn.make("team")
      .label("Team")
      .maxVisible(3)
      .size("sm")
      .fields({ name: "name", src: "avatar" }),

    DateColumn.make("deadline").label("Deadline").sortable().relative(),

    ActionsColumn.make<Project>()
      .view((row) => (window.location.href = `/projects/${row.id}`))
      .edit((row) => console.log("Edit", row.id))
      .delete((row) => console.log("Delete", row.id)),
  )
  .build();
```

## Documentation

- [Installation Guide](./INSTALLATION.md) - Detailed installation instructions
- [Usage Guide](./docs/USAGE.md) - Complete API reference and examples
- [Column Types](./docs/USAGE.md#column-types) - All column types and their methods

## Advanced Features

### Empty States

```tsx
import { EmptyStateBuilder } from "tablefy";

const emptyState = EmptyStateBuilder.make()
  .title("No projects found")
  .description("Get started by creating your first project")
  .action("Create Project", () => createProject())
  .build();
```

### Search & Filters

```tsx
<DataTable
  columns={columns}
  data={data}
  config={{
    search: {
      enabled: true,
      placeholder: "Search projects...",
      columns: ["name", "url"],
    },
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
    ],
  }}
/>
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT Tablefy Contributors

## Acknowledgments

Built with:

- [TanStack Table](https://tanstack.com/table) - Headless table library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
