# Editable Columns - InputColumn & SelectColumn

Tablefy provides two specialized columns for **inline editing** directly in the table: `InputColumn` and `SelectColumn`. Both follow the same Builder Pattern as all other columns.

## 📝 InputColumn

The `InputColumn` allows users to edit text values directly in the table.

### Basic Usage

```tsx
import { TableSchema, InputColumn } from "@nccirtu/tablefy";
import { router } from "@inertiajs/react";

type Project = {
  id: string;
  name: string;
  description: string;
};

const projectColumns = TableSchema.make<Project>()
  .columns(
    InputColumn.make<Project>("name")
      .label("Project Name")
      .sortable()
      .placeholder("Enter project name...")
      .onSave((project, newValue) => {
        router.put(`/projects/${project.id}`, {
          name: newValue,
        });
      }),
  )
  .build();
```

### Available Methods

| Method                  | Description                       | Example                            |
| ----------------------- | --------------------------------- | ---------------------------------- |
| `label(string)`         | Set column header                 | `.label('Name')`                   |
| `sortable()`            | Enable sorting                    | `.sortable()`                      |
| `placeholder(string)`   | Set input placeholder             | `.placeholder('Enter value...')`   |
| `type(string)`          | Set input type                    | `.type('email')`                   |
| `disabled(boolean\|fn)` | Disable input                     | `.disabled(true)`                  |
| `onSave(fn)`            | Called on blur when value changed | `.onSave((row, value) => {...})`   |
| `onChange(fn)`          | Called on every keystroke         | `.onChange((row, value) => {...})` |
| `debounce(ms)`          | Debounce onChange (future)        | `.debounce(500)`                   |

### Input Type Shortcuts

```tsx
// Email input
InputColumn.make<User>("email")
  .label("Email")
  .email()
  .onSave((user, newEmail) => {
    updateUser(user.id, { email: newEmail });
  });

// Number input
InputColumn.make<Product>("price")
  .label("Price")
  .number()
  .onSave((product, newPrice) => {
    updateProduct(product.id, { price: parseFloat(newPrice) });
  });

// Password input
InputColumn.make<User>("password")
  .label("Password")
  .password()
  .onSave((user, newPassword) => {
    updatePassword(user.id, newPassword);
  });

// URL input
InputColumn.make<Project>("website")
  .label("Website")
  .url()
  .onSave((project, newUrl) => {
    updateProject(project.id, { website: newUrl });
  });
```

### Conditional Disable

```tsx
InputColumn.make<Project>("name")
  .label("Project Name")
  .disabled((project) => project.status === "archived")
  .onSave((project, newName) => {
    updateProject(project.id, { name: newName });
  });
```

### onSave vs onChange

**`onSave`** - Triggered when input loses focus (blur) and value has changed:

```tsx
InputColumn.make<Project>("name").onSave((project, newName) => {
  // Only called when user leaves the input AND value changed
  router.put(`/projects/${project.id}`, { name: newName });
});
```

**`onChange`** - Triggered on every keystroke:

```tsx
InputColumn.make<Project>("name").onChange((project, newName) => {
  // Called on EVERY keystroke - use with debounce!
  console.log("Current value:", newName);
});
```

---

## 📋 SelectColumn

The `SelectColumn` allows users to select from predefined options directly in the table.

### Basic Usage

```tsx
import { TableSchema, SelectColumn } from "@nccirtu/tablefy";
import { router } from "@inertiajs/react";

type Project = {
  id: string;
  name: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "inactive" | "pending";
};

const projectColumns = TableSchema.make<Project>()
  .columns(
    SelectColumn.make<Project>("priority")
      .label("Priority")
      .sortable()
      .options([
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
        { label: "Critical", value: "critical" },
      ])
      .onValueChange((project, newPriority) => {
        router.put(`/projects/${project.id}`, {
          priority: newPriority,
        });
      }),
  )
  .build();
```

### Available Methods

| Method                  | Description               | Example                                 |
| ----------------------- | ------------------------- | --------------------------------------- |
| `label(string)`         | Set column header         | `.label('Status')`                      |
| `sortable()`            | Enable sorting            | `.sortable()`                           |
| `options(array)`        | Set select options        | `.options([...])`                       |
| `placeholder(string)`   | Set placeholder           | `.placeholder('Select...')`             |
| `disabled(boolean\|fn)` | Disable select            | `.disabled(true)`                       |
| `onValueChange(fn)`     | Called when value changes | `.onValueChange((row, value) => {...})` |

### Select Options

Options are defined as an array of objects with `label` and `value`:

```tsx
SelectColumn.make<Project>("status").options([
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending" },
]);
```

### Disabled Options

Individual options can be disabled:

```tsx
SelectColumn.make<Project>("status").options([
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived", disabled: true },
  { label: "Deleted", value: "deleted", disabled: true },
]);
```

### Conditional Disable

```tsx
SelectColumn.make<Project>('status')
  .options([...])
  .disabled((project) => project.isLocked)
  .onValueChange((project, newStatus) => {
    updateProject(project.id, { status: newStatus });
  })
```

---

## 🎯 Complete Example with Laravel/Inertia

```tsx
import {
  TableSchema,
  TextColumn,
  InputColumn,
  SelectColumn,
} from "@nccirtu/tablefy";
import { router } from "@inertiajs/react";

type Project = {
  id: string;
  name: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "inactive" | "pending";
  isLocked: boolean;
};

interface ProjectsPageProps {
  projects: Project[];
}

export const projectColumns = TableSchema.make<Project>()
  .title("Projects")
  .searchable()
  .paginated()
  .columns(
    TextColumn.make<Project>("id").label("ID").sortable(),

    // Editable Name Input
    InputColumn.make<Project>("name")
      .label("Project Name")
      .sortable()
      .placeholder("Enter project name...")
      .onSave((project, newName) => {
        router.put(
          `/projects/${project.id}`,
          { name: newName },
          {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
              toast.success("Project name updated!");
            },
          },
        );
      }),

    // Editable Description Input
    InputColumn.make<Project>("description")
      .label("Description")
      .placeholder("Enter description...")
      .disabled((project) => project.isLocked)
      .onSave((project, newDescription) => {
        router.put(`/projects/${project.id}`, {
          description: newDescription,
        });
      }),

    // Editable Priority Select
    SelectColumn.make<Project>("priority")
      .label("Priority")
      .sortable()
      .options([
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
        { label: "Critical", value: "critical" },
      ])
      .onValueChange((project, newPriority) => {
        router.put(`/projects/${project.id}`, {
          priority: newPriority,
        });
      }),

    // Editable Status Select
    SelectColumn.make<Project>("status")
      .label("Status")
      .sortable()
      .options([
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Pending", value: "pending" },
      ])
      .disabled((project) => project.isLocked)
      .onValueChange((project, newStatus) => {
        router.put(`/projects/${project.id}`, {
          status: newStatus,
        });
      }),
  )
  .build();

export default function ProjectsPage({ projects }: ProjectsPageProps) {
  const { columns, config } = projectColumns;

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} config={config} data={projects} />
    </div>
  );
}
```

---

## 💡 Best Practices

### 1. Use `onSave` for API Calls

Prefer `onSave` over `onChange` for API calls to avoid excessive requests:

```tsx
// ✅ Good - Only saves when user leaves the input
InputColumn.make<Project>("name").onSave((project, newName) => {
  updateProject(project.id, { name: newName });
});

// ❌ Bad - Saves on every keystroke
InputColumn.make<Project>("name").onChange((project, newName) => {
  updateProject(project.id, { name: newName }); // Too many API calls!
});
```

### 2. Preserve State with Inertia

Use `preserveState` and `preserveScroll` to keep the UI stable:

```tsx
SelectColumn.make<Project>('status')
  .options([...])
  .onValueChange((project, newStatus) => {
    router.put(`/projects/${project.id}`,
      { status: newStatus },
      {
        preserveState: true,
        preserveScroll: true
      }
    );
  })
```

### 3. Provide User Feedback

Show success/error messages:

```tsx
import { toast } from "sonner"; // or your toast library

InputColumn.make<Project>("name").onSave((project, newName) => {
  router.put(
    `/projects/${project.id}`,
    { name: newName },
    {
      onSuccess: () => toast.success("Updated!"),
      onError: () => toast.error("Failed to update"),
    },
  );
});
```

### 4. Conditional Editing

Disable editing based on row data:

```tsx
InputColumn.make<Project>("name").disabled((project) => {
  // Disable if project is archived or user lacks permission
  return project.status === "archived" || !project.canEdit;
});
```

### 5. Type Safety

Always specify the generic type for type-safe callbacks:

```tsx
// ✅ Type-safe
InputColumn.make<Project>("name").onSave((project, newName) => {
  // project is typed as Project
  // newName is typed as string
});
```

---

## 🔄 Migration from Old API

If you're using the old function-based API, here's how to migrate:

### Old API (Deprecated)

```tsx
import { InputColumn, SelectColumn } from "@nccirtu/tablefy/columns";

const columns = [
  InputColumn({
    accessorKey: "name",
    header: "Name",
    placeholder: "Enter name...",
    onChange: (row, value) => console.log(row, value),
  }),

  SelectColumn({
    accessorKey: "status",
    header: "Status",
    options: [{ label: "Active", value: "active" }],
    onChange: (row, value) => console.log(row, value),
  }),
];
```

### New API (Builder Pattern)

```tsx
import { TableSchema, InputColumn, SelectColumn } from "@nccirtu/tablefy";

const { columns } = TableSchema.make<Project>()
  .columns(
    InputColumn.make<Project>("name")
      .label("Name")
      .placeholder("Enter name...")
      .onSave((row, value) => console.log(row, value)),

    SelectColumn.make<Project>("status")
      .label("Status")
      .options([{ label: "Active", value: "active" }])
      .onValueChange((row, value) => console.log(row, value)),
  )
  .build();
```

### Key Changes

- ✅ Use `InputColumn.make<T>()` instead of `InputColumn({})`
- ✅ Use `SelectColumn.make<T>()` instead of `SelectColumn({})`
- ✅ Use `.onSave()` instead of `onChange` for InputColumn
- ✅ Use `.onValueChange()` instead of `onChange` for SelectColumn
- ✅ Chain methods with fluent API
- ✅ Wrap in `TableSchema.make<T>().columns(...).build()`

---

## 📚 See Also

- [Column Types](./USAGE.md#column-types) - All available column types
- [TableSchema Builder](./USAGE.md#tableschema) - Schema configuration
- [Laravel Integration](./INSTALLATION.md#laravel-integration) - Backend setup
