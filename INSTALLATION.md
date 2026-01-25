# Tablefy - Installation Guide

## 📦 Step 1: Install the Package

```bash
npm install @nccirtu/tablefy
```

## 🔧 Step 2: Install Required Dependencies

```bash
npm install @tanstack/react-table lucide-react class-variance-authority clsx tailwind-merge
```

## 🎨 Step 3: Install shadcn/ui Components

Tablefy uses shadcn/ui components. You need to install these in your project:

```bash
npx shadcn@latest add button
npx shadcn@latest add table
npx shadcn@latest add checkbox
npx shadcn@latest add dropdown-menu
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add badge
npx shadcn@latest add progress
npx shadcn@latest add tooltip
```

## ⚙️ Step 4: Configure Tailwind

### For Laravel 12 (Tailwind v4)

Add the package path to your `resources/css/app.css` file using the `@source` directive:

```css
@import "tailwindcss";

/* Add this line: */
@source '../../node_modules/@nccirtu/tablefy/dist';

@source '../views';
/* ... rest of your config */
```

### For Next.js / Vite / Other (Tailwind v3)

Add the package path to your `tailwind.config.js` or `tailwind.config.ts`:

```js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    // Add this line:
    "./node_modules/@nccirtu/tablefy/dist/**/*.{js,mjs}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## 🔄 Step 5: Restart Development Server

```bash
# Stop your dev server (Ctrl+C)

# Clear Vite cache (choose one based on your OS)
# Unix/macOS:
rm -rf node_modules/.vite

# Windows PowerShell:
# Remove-Item -Recurse -Force node_modules/.vite

# Cross-platform (requires npm):
# npx rimraf node_modules/.vite

# Start again
npm run dev
```

## ✅ Verify Installation

Create a test file to verify everything works:

```tsx
import { TableSchema, EmptyStateBuilder } from "@nccirtu/tablefy";
import { TextColumn } from "@nccirtu/tablefy/columns";

type User = {
  id: string;
  name: string;
};

const { columns, config } = TableSchema.make<User>()
  .description("User list")
  .searchable()
  .paginated()
  .columns(TextColumn.make("name").label("Name").sortable())
  .emptyState(
    EmptyStateBuilder.noData({
      title: "No users",
      description: "Get started by creating your first user",
    }),
  )
  .build();

console.log("Tablefy installed successfully!", { columns, config });
```

### Full Verification (with Rendering)

Create a component to visually verify that Tablefy renders correctly with styling:

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
  { id: "3", name: "Charlie Brown", email: "charlie@example.com" },
];

const { columns, config } = TableSchema.make<User>()
  .description("User list")
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

export function VerifyTablefy() {
  return <DataTable data={users} columns={columns} config={config} />;
}
```

Drop the `VerifyTablefy` component into your app to confirm styling and behavior. If it renders with proper Tailwind styles and interactivity, Tablefy is fully integrated!

## 🐛 Troubleshooting

### Styles not appearing?

1. **Check Tailwind configuration**: Make sure you added the `@source` directive (Laravel) or `content` path (other frameworks)
2. **Clear cache**: Run one of these commands based on your OS:
   - Unix/macOS: `rm -rf node_modules/.vite`
   - Windows PowerShell: `Remove-Item -Recurse -Force node_modules/.vite`
   - Cross-platform: `npx rimraf node_modules/.vite`
3. **Restart dev server**: Stop and start `npm run dev`

### Module not found errors?

Make sure all dependencies are installed:

```bash
npm list @tanstack/react-table lucide-react class-variance-authority clsx tailwind-merge
```

### TypeScript errors?

Ensure TypeScript 5.0+:

```bash
npm install -D typescript@^5.0.0
```

### Import errors with `/columns`?

Make sure you're importing correctly:

```tsx
// ✅ Correct
import { TableSchema, EmptyStateBuilder } from "@nccirtu/tablefy";
import { TextColumn, CheckboxColumn } from "@nccirtu/tablefy/columns";

// ❌ Wrong
import { EmptyStateBuilder } from "@nccirtu/tablefy/columns"; // EmptyStateBuilder is not in /columns
```

## 📚 Next Steps

- Read the [Usage Guide](./README.md#quick-start)
- Explore [Column Types](./README.md#column-types)
- Check out [Examples](./README.md#example-project-management-table)
