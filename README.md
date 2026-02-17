# Tablefy

A powerful, type-safe React toolkit for building schema-driven **Data Tables** and **Forms**. Built on [shadcn/ui](https://ui.shadcn.com/) and designed for [Laravel](https://laravel.com/) + [Inertia.js v2](https://inertiajs.com/) + [Wayfinder](https://github.com/laravel/wayfinder).

## Features

### Data Tables
- **Beautiful UI** - Built on shadcn/ui components with Tailwind CSS
- **Search & Filter** - Built-in search and advanced filtering
- **Sorting & Pagination** - Full sorting and pagination support (client & server-side)
- **14+ Column Types** - Text, Badge, Date, Link, Progress, Avatar, Icon, Image, Actions, and more
- **Confirm Dialogs** - Built-in confirmation system for destructive actions

### Forms
- **Schema-Driven** - Define forms with a fluent builder API
- **11 Field Types** - TextInput, Textarea, Select, Checkbox, CheckboxGroup, Toggle, RadioGroup, DatePicker, FileUpload, Repeater, Hidden
- **Layout Builders** - Sections (collapsible cards), Tabs, Wizard (multi-step)
- **Field Dependencies** - Show/hide/enable/disable fields based on other field values
- **Grid Layout** - Responsive multi-column grids with columnSpan support

### Inertia.js Integration
- **useInertiaForm** - Bridge FormSchema with Inertia's `useForm` for seamless state management
- **useServerTable** - Server-side pagination, sorting, and filtering with `router.visit()`
- **Precognition** - Live server-side validation on field blur
- **Wayfinder** - Type-safe route helpers as form action URLs

### Core
- **Type-Safe** - Complete TypeScript support with generics and type inference
- **Fluent API** - Chainable builder pattern for easy, readable configuration
- **Tree-Shakeable** - Sub-path exports (`/forms`, `/inertia`, `/columns`) for optimal bundle size
- **Zero Breaking Changes** - Forms and Inertia are purely additive to the existing table API

## Installation

```bash
npm install @nccirtu/tablefy
```

**Quick setup with CLI:**

```bash
npx tablefy init
```

### Peer Dependencies

```bash
# Core (required)
npm install @tanstack/react-table lucide-react class-variance-authority clsx tailwind-merge

# shadcn/ui components (install what you need)
npx shadcn@latest add button table checkbox dropdown-menu input select badge progress tooltip label card tabs textarea switch radio-group calendar popover separator

# Optional: Inertia.js integration
npm install @inertiajs/react

# Optional: Zod validation
npm install zod
```

### Configure Tailwind

**Tailwind v4 (Laravel 12):**

```css
@import "tailwindcss";
@source '../../node_modules/@nccirtu/tablefy/dist';
```

**Tailwind v3:**

```js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nccirtu/tablefy/dist/**/*.{js,mjs}",
  ],
};
```

See the [full installation guide](./docs/INSTALLATION.md) for framework-specific instructions.

## Quick Start: Data Table

```tsx
import { DataTable, TableSchema, TextColumn, BadgeColumn, DateColumn } from "@nccirtu/tablefy";

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

## Quick Start: Form

```tsx
import { FormSchema, TextInput, Select, Textarea, FormRenderer } from "@nccirtu/tablefy/forms";
import { useState } from "react";

type CreateUser = {
  name: string;
  email: string;
  role: string;
  bio: string;
};

const schema = FormSchema.make<CreateUser>()
  .title("Create User")
  .description("Add a new team member")
  .columns(2)
  .bordered()
  .fields(
    TextInput.make<CreateUser>("name").label("Name").required(),
    TextInput.make<CreateUser>("email").label("Email").email().required(),
    Select.make<CreateUser>("role")
      .label("Role")
      .options([
        { value: "admin", label: "Admin" },
        { value: "editor", label: "Editor" },
        { value: "viewer", label: "Viewer" },
      ])
      .required(),
    Textarea.make<CreateUser>("bio").label("Biography").rows(4).columnSpan(2),
  )
  .actions((a) => a.submit({ label: "Create User" }).cancel({ label: "Cancel" }))
  .build();

function CreateUserPage() {
  const [data, setData] = useState<CreateUser>({ name: "", email: "", role: "", bio: "" });
  const [errors, setErrors] = useState({});

  return (
    <FormRenderer
      schema={schema}
      data={data}
      errors={errors}
      onChange={(field, value) => setData((prev) => ({ ...prev, [field]: value }))}
      onSubmit={() => console.log("Submit:", data)}
    />
  );
}
```

## Quick Start: Inertia.js + Laravel

```tsx
import { FormSchema, TextInput, Select, FormRenderer } from "@nccirtu/tablefy/forms";
import { useInertiaForm } from "@nccirtu/tablefy/inertia";

type CreateUser = { name: string; email: string; role: string };

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
      ])
      .columnSpan(2),
  )
  .actions((a) => a.submit({ label: "Create" }).cancel({ label: "Cancel", href: "/users" }))
  .build();

export default function CreateUserPage() {
  const { data, errors, onChange, onSubmit, processing } = useInertiaForm<CreateUser>({
    schema,
    url: "/users",
    method: "post",
  });

  return (
    <FormRenderer
      schema={schema}
      data={data}
      errors={errors}
      onChange={onChange}
      onSubmit={onSubmit}
      processing={processing}
    />
  );
}
```

## Column Types

| Column Type | Description | Key Methods |
|---|---|---|
| `TextColumn` | Simple text display | `sortable()`, `prefix()`, `suffix()`, `limit()`, `uppercase()` |
| `NumberColumn` | Numbers & currency | `money()`, `percent()`, `decimals()`, `locale()` |
| `DateColumn` | Dates & times | `short()`, `long()`, `relative()`, `datetime()`, `withIcon()` |
| `BadgeColumn` | Status badges | `variants()`, `boolean()`, `status()` |
| `LinkColumn` | Clickable links | `href()`, `external()`, `underline()`, `openInNewTab()` |
| `ProgressColumn` | Progress bars | `max()`, `colorByThreshold()`, `showPercentage()`, `format()` |
| `AvatarGroupColumn` | Avatar groups | `maxVisible()`, `size()`, `overlap()`, `fields()`, `showNames()` |
| `IconColumn` | Status icons | `boolean()`, `priority()`, `onlineStatus()`, `verification()`, `states()` |
| `ImageColumn` | Single images | `size()`, `rounded()`, `circular()`, `fallback()` |
| `CheckboxColumn` | Selection checkboxes | -- |
| `ActionsColumn` | Dropdown menus | `view()`, `edit()`, `delete()`, `action()`, `link()` |
| `EnumColumn` | Enum display | `options()` |

## Form Field Types

| Field Type | Description | Key Methods |
|---|---|---|
| `TextInput` | Single-line text | `email()`, `password()`, `number()`, `url()`, `tel()`, `prefix()`, `suffix()`, `minLength()`, `maxLength()` |
| `Textarea` | Multi-line text | `rows()`, `minLength()`, `maxLength()`, `autoResize()` |
| `Select` | Dropdown select | `options()`, `multiple()`, `searchable()`, `clearable()`, `loadOptions()` |
| `Checkbox` | Boolean checkbox | (inherits base methods) |
| `CheckboxGroup` | Multiple checkboxes | `options()`, `columns()` |
| `Toggle` | On/off switch | `onLabel()`, `offLabel()` |
| `RadioGroup` | Radio buttons | `options()`, `horizontal()`, `vertical()` |
| `DatePicker` | Date calendar | `minDate()`, `maxDate()`, `format()`, `includeTime()`, `locale()` |
| `FileUpload` | File drag & drop | `accept()`, `maxSize()`, `multiple()`, `maxFiles()`, `image()`, `pdf()` |
| `Repeater` | Dynamic list | `fields()`, `minItems()`, `maxItems()`, `addLabel()`, `orderable()` |
| `Hidden` | Hidden input | (inherits base methods) |

## Layout Options

### Sections (Collapsible Cards)

```tsx
FormSchema.make<T>()
  .fields(/* ... */)
  .sections(
    SectionBuilder.make("Personal").fields(["name", "email"]).columns(2),
    SectionBuilder.make("Address").fields(["street", "city"]).collapsible(),
  )
  .build();
```

### Tabs

```tsx
FormSchema.make<T>()
  .fields(/* ... */)
  .tabs(
    TabBuilder.make("Profile").fields(["name", "email"]).icon(<User />),
    TabBuilder.make("Settings").fields(["language", "timezone"]),
  )
  .build();
```

### Wizard (Multi-Step)

```tsx
FormSchema.make<T>()
  .fields(/* ... */)
  .wizard(
    WizardStep.make("Account").fields(["email", "password"])
      .canProceed((d) => !!d.email && !!d.password),
    WizardStep.make("Profile").fields(["name", "bio"]),
  )
  .build();
```

## Import Paths

```tsx
// Everything
import { DataTable, TableSchema, TextColumn, FormSchema, TextInput } from "@nccirtu/tablefy";

// Columns only (tree-shakeable)
import { TextColumn, BadgeColumn } from "@nccirtu/tablefy/columns";

// Forms only (tree-shakeable, no TanStack Table)
import { FormSchema, TextInput, Select, FormRenderer } from "@nccirtu/tablefy/forms";

// Inertia integration (requires @inertiajs/react)
import { useInertiaForm, useServerTable } from "@nccirtu/tablefy/inertia";
```

## Documentation

- [Installation Guide](./docs/INSTALLATION.md) - Detailed setup instructions
- [Data Tables Guide](./docs/USAGE.md) - Complete table API reference and examples
- [Forms Guide](./docs/FORMS.md) - All form field types, layouts, and examples
- [Inertia Integration](./docs/INERTIA.md) - Server-side tables, useInertiaForm, Precognition
- [Actions Column](./docs/ACTIONS_COLUMN.md) - Custom render functions and confirm dialogs
- [Editable Columns](./docs/EDITABLE_COLUMNS.md) - InputColumn and SelectColumn guide

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT Tablefy Contributors

## Acknowledgments

Built with:

- [TanStack Table](https://tanstack.com/table) - Headless table library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Inertia.js](https://inertiajs.com/) - The modern monolith
- [Laravel](https://laravel.com/) - The PHP framework
