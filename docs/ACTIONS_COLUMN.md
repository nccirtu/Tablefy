# ActionsColumn - Advanced Usage

## Overview

The `ActionsColumn` provides flexible ways to add actions to your table rows. You can use standard menu items or create completely custom UI with the `render` function.

## Basic Usage

```tsx
import { ActionsColumn } from "@nccirtu/tablefy";

const columns = [
  ActionsColumn.make<Project>()
    .action({
      label: "View",
      onClick: (project) => console.log(project),
    })
    .action({
      label: "Edit",
      onClick: (project) => router.visit(`/projects/${project.id}/edit`),
    })
    .delete(async (project) => {
      await api.delete(`/projects/${project.id}`);
    })
    .build(),
];
```

## Custom Render Function

The `render` function allows you to create complex UI elements directly in the actions dropdown:

```tsx
import { ActionsColumn, ActionItem } from "@nccirtu/tablefy";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const columns = [
  ActionsColumn.make<Project>()
    .action({
      render: (project) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              Edit Details
            </Button>
          </DialogTrigger>
          <DialogContent>
            <ProjectEditForm project={project} />
          </DialogContent>
        </Dialog>
      ),
    })
    .action({
      label: "View",
      onClick: (project) => router.visit(`/projects/${project.id}`),
    })
    .build(),
];
```

### When to use `render`

Use the `render` function when you need:

- **Dialog/Modal triggers** - Open forms or details in a dialog
- **Complex UI** - Multiple buttons, custom layouts
- **Inline forms** - Edit directly in the dropdown
- **Custom interactions** - Drag handles, toggles, etc.

### Standard vs Custom Render

| Feature     | Standard Action | Custom Render                     |
| ----------- | --------------- | --------------------------------- |
| Label       | Required        | Optional (ignored if render used) |
| Icon        | Optional        | N/A                               |
| onClick     | Optional        | N/A                               |
| render      | N/A             | Required                          |
| Styling     | Automatic       | Full control                      |
| Flexibility | Limited         | Unlimited                         |

## Confirm Helper

The package includes a built-in confirmation dialog system for destructive actions.

### Setup

Wrap your app with `ConfirmProvider`:

```tsx
import { ConfirmProvider } from "@nccirtu/tablefy";

function App() {
  return (
    <ConfirmProvider>
      <YourApp />
    </ConfirmProvider>
  );
}
```

### Usage

```tsx
import { ActionsColumn, confirm } from "@nccirtu/tablefy";

const columns = [
  ActionsColumn.make<Project>()
    .action({
      label: "Delete",
      variant: "destructive",
      onClick: async (project) => {
        const confirmed = await confirm({
          title: "Delete Project?",
          description: `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
          confirmLabel: "Yes, delete",
          cancelLabel: "Cancel",
          variant: "destructive",
        });

        if (confirmed) {
          await api.delete(`/projects/${project.id}`);
          toast.success("Project deleted");
        }
      },
    })
    .build(),
];
```

### Confirm Options

```tsx
interface ConfirmOptions {
  title?: string; // Dialog title (default: "Bestätigung erforderlich")
  description?: string; // Description text
  confirmLabel?: string; // Confirm button text (default: "Bestätigen")
  cancelLabel?: string; // Cancel button text (default: "Abbrechen")
  variant?: "destructive" | "default"; // Button variant (default: "default")
}
```

## Complete Example with Laravel/Inertia

```tsx
import {
  DataTable,
  ActionsColumn,
  confirm,
  ConfirmProvider,
} from "@nccirtu/tablefy";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";

interface Project {
  id: number;
  name: string;
  status: string;
}

function ProjectsPage({ projects }: { projects: Project[] }) {
  const columns = [
    // ... other columns
    ActionsColumn.make<Project>()
      .action({
        label: "View",
        onClick: (project) => router.visit(`/projects/${project.id}`),
      })
      .action({
        render: (project) => (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                Quick Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <h2>Edit {project.name}</h2>
              <ProjectQuickEditForm project={project} />
            </DialogContent>
          </Dialog>
        ),
      })
      .separator()
      .action({
        label: "Delete",
        variant: "destructive",
        onClick: async (project) => {
          const confirmed = await confirm({
            title: "Delete Project?",
            description: `Delete "${project.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            cancelLabel: "Cancel",
            variant: "destructive",
          });

          if (confirmed) {
            router.delete(`/projects/${project.id}`, {
              onSuccess: () => toast.success("Project deleted"),
            });
          }
        },
      })
      .build(),
  ];

  return <DataTable data={projects} columns={columns} />;
}

// Wrap your app
export default function App() {
  return (
    <ConfirmProvider>
      <ProjectsPage {...props} />
    </ConfirmProvider>
  );
}
```

## ActionItem Type Reference

```tsx
interface ActionItem<TData> {
  label?: string; // Optional when render is used
  icon?: ReactNode; // Icon to display
  onClick?: (row: TData) => void; // Click handler
  href?: (row: TData) => string; // Link URL
  render?: (row: TData) => ReactNode; // Custom renderer (takes priority)
  variant?: "default" | "destructive"; // Visual style
  separator?: boolean; // Show separator after this action
  hidden?: (row: TData) => boolean; // Conditionally hide action
  disabled?: (row: TData) => boolean; // Conditionally disable action
}
```

## Migration from v0.6.x

### Breaking Changes

None! The new features are **fully backwards compatible**.

### What's New

1. **Optional `label`** - Now optional when using `render`
2. **New `render` function** - Create custom UI in actions
3. **Confirm helper** - Built-in confirmation dialogs

### Upgrading

```bash
npm install @nccirtu/tablefy@latest
```

Existing code continues to work without changes. New features are opt-in.

## Best Practices

### 1. Use Standard Actions for Simple Cases

```tsx
// ✅ Good - simple action
.action({
  label: "View",
  onClick: (row) => router.visit(`/items/${row.id}`)
})
```

### 2. Use Render for Complex UI

```tsx
// ✅ Good - complex UI needs render
.action({
  render: (row) => (
    <Dialog>
      <DialogTrigger>...</DialogTrigger>
      <DialogContent>...</DialogContent>
    </Dialog>
  )
})
```

### 3. Always Confirm Destructive Actions

```tsx
// ✅ Good - confirms before delete
onClick: async (row) => {
  const ok = await confirm({
    title: "Delete?",
    variant: "destructive",
  });
  if (ok) await api.delete(`/items/${row.id}`);
};
```

### 4. Handle Errors Gracefully

```tsx
onClick: async (row) => {
  const confirmed = await confirm({ title: "Delete?" });
  if (!confirmed) return;

  try {
    await api.delete(`/items/${row.id}`);
    toast.success("Deleted successfully");
  } catch (error) {
    toast.error("Failed to delete");
  }
};
```

## Troubleshooting

### "ConfirmProvider is not mounted"

Make sure `ConfirmProvider` wraps your app:

```tsx
// ❌ Wrong
<App />

// ✅ Correct
<ConfirmProvider>
  <App />
</ConfirmProvider>
```

### Custom render not showing

Ensure you're returning valid React elements:

```tsx
// ❌ Wrong
render: (row) => {
  console.log(row);
};

// ✅ Correct
render: (row) => <Button>Click me</Button>;
```

### Hooks not working in render

Hooks work fine in `render` because it's called during React render phase:

```tsx
// ✅ This works
render: (row) => {
  const [open, setOpen] = useState(false);
  return <Dialog open={open}>...</Dialog>;
};
```
