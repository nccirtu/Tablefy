# Tablefy - Installation Guide

## 🚀 Quick Install (Recommended)

The easiest way to set up Tablefy is using the CLI:

```bash
# Install the package
npm install @nccirtu/tablefy

# Run the setup wizard
npx tablefy init
```

The CLI will automatically:

1. ✅ Check if shadcn/ui is initialized
2. ✅ Install missing peer dependencies
3. ✅ Install required shadcn/ui components
4. ✅ Copy Tablefy components to your project

---

## 📦 Manual Installation

If you prefer to set up manually, follow these steps:

### Step 1: Install the Package

```bash
npm install @nccirtu/tablefy
```

### Step 2: Install Peer Dependencies

```bash
npm install @tanstack/react-table lucide-react class-variance-authority clsx tailwind-merge
```

### Step 3: Install shadcn/ui Components

Tablefy uses shadcn/ui components. Install them in your project:

```bash
npx shadcn@latest add button table checkbox dropdown-menu input select badge progress tooltip
```

### Step 4: Add Tablefy Components

Use the CLI to add Tablefy's custom components:

```bash
npx tablefy add data-table avatar-list
```

Or add all components at once:

```bash
npx tablefy init --skip-shadcn
```

### Step 5: Configure Tailwind

#### For Tailwind v4 (Laravel 12, etc.)

Add to your `resources/css/app.css`:

```css
@import "tailwindcss";

@source '../../node_modules/@nccirtu/tablefy/dist';
```

#### For Tailwind v3 (Next.js, Vite, etc.)

Add to your `tailwind.config.js`:

```js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nccirtu/tablefy/dist/**/*.{js,mjs}",
  ],
  // ...
};
```

### Step 6: Configure Vite (Laravel/Vite Projects)

If you're using Laravel with Vite, add the following alias configuration to your `vite.config.js`:

```js
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react"; // or vue, etc.
import path from "path";

export default defineConfig({
  plugins: [
    laravel({
      input: ["resources/css/app.css", "resources/js/app.tsx"],
      refresh: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./resources/js"),
    },
  },
});
```

This configures Vite to resolve `@/` imports to your `resources/js` directory, which is required for Tablefy's internal imports to work correctly.

---

## 🛠️ CLI Commands

### `npx tablefy init`

Initialize Tablefy in your project. This is the recommended way to get started.

**Options:**

- `-y, --yes` - Skip all confirmation prompts
- `--skip-shadcn` - Skip shadcn/ui component installation
- `-c, --components <path>` - Custom path to components directory

**Examples:**

```bash
# Interactive setup
npx tablefy init

# Non-interactive setup (CI/CD)
npx tablefy init -y

# Custom components path
npx tablefy init -c src/components
```

### `npx tablefy add [components...]`

Add specific Tablefy components to your project.

**Available components:**

- `data-table` - Main DataTable component with pagination, search, and more
- `avatar-list` - Avatar list component for displaying user groups

**Examples:**

```bash
# Add specific components
npx tablefy add data-table

# Add multiple components
npx tablefy add data-table avatar-list

# Interactive selection
npx tablefy add
```

---

## ✅ Verify Installation

Create a test component:

```tsx
import { DataTable, TableSchema, EmptyStateBuilder } from "@nccirtu/tablefy";
import { TextColumn } from "@nccirtu/tablefy/columns";

type User = {
  id: string;
  name: string;
  email: string;
};

const users: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "2", name: "Bob Smith", email: "bob@example.com" },
];

const { columns, config } = TableSchema.make<User>()
  .searchable()
  .paginated()
  .columns(
    TextColumn.make("name").label("Name").sortable(),
    TextColumn.make("email").label("Email"),
  )
  .emptyState(
    EmptyStateBuilder.noData({
      title: "No users",
      description: "Get started by creating your first user",
    }),
  )
  .build();

export function UsersTable() {
  return <DataTable data={users} columns={columns} config={config} />;
}
```

---

## 🐛 Troubleshooting

### "Components not found" errors

Make sure you ran the CLI to copy Tablefy components:

```bash
npx tablefy init
```

### Styles not appearing

1. Check your Tailwind configuration includes the Tablefy path
2. Clear your build cache:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### shadcn/ui not initialized

Run the shadcn init command first:

```bash
npx shadcn@latest init
```

Then run Tablefy setup:

```bash
npx tablefy init
```

### Import errors

Make sure you're importing from the correct paths:

```tsx
// ✅ Correct
import { TableSchema, DataTable, EmptyStateBuilder } from "@nccirtu/tablefy";
import { TextColumn, BadgeColumn } from "@nccirtu/tablefy/columns";

// ❌ Wrong - EmptyStateBuilder is not in /columns
import { EmptyStateBuilder } from "@nccirtu/tablefy/columns";
```

---

## 📚 Next Steps

- [Usage Guide](./docs/USAGE.md) - Learn how to use all column types
- [Examples](./README.md#example-project-management-table) - See full examples
- [GitHub](https://github.com/nccirtu/Tablefy) - Report issues and contribute
