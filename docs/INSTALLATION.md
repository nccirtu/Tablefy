# Tablefy - Installation Guide

## Two Ways to Use Tablefy

Tablefy offers **two approaches** depending on your needs:

### Approach 1: Direct Import (Quick Start)

**Best for:** Getting started quickly, standard use cases

Import components directly from the npm package:

```tsx
import { DataTable, TableSchema, TextColumn } from "@nccirtu/tablefy";
import { BadgeColumn, DateColumn } from "@nccirtu/tablefy/columns";
import { FormSchema, TextInput, Select } from "@nccirtu/tablefy/forms";
```

**Advantages:**

- Works immediately after `npm install`
- No CLI setup required
- Automatic updates when you upgrade the package
- Smaller project footprint

**Limitations:**

- Cannot customize internal DataTable/FormRenderer components
- Limited control over component behavior

### Approach 2: CLI Installation (Full Control)

**Best for:** Custom styling, advanced modifications, full control

Copy components to your project using the CLI:

```bash
npx tablefy init
```

This copies all Tablefy components to `components/tablefy/` in your project, allowing you to:

- Modify component styles and behavior
- Customize internal logic
- Full ownership of the code

**Advantages:**

- Complete customization freedom
- Modify any component to fit your needs
- No dependency on package internals

**Limitations:**

- Manual updates required
- More files in your project
- Requires CLI setup step

---

**Recommendation:** Start with **Approach 1** (direct import) for quick prototyping. Switch to **Approach 2** (CLI installation) when you need to customize internal components.

---

## Quick Install (Recommended)

The easiest way to set up Tablefy is using the CLI:

```bash
# Install the package
npm install @nccirtu/tablefy

# Run the setup wizard
npx tablefy init
```

The CLI will automatically:

1. Check if shadcn/ui is initialized
2. Install missing peer dependencies
3. Install required shadcn/ui components
4. Copy Tablefy components to your project

---

## Manual Installation

If you prefer to set up manually, follow these steps:

### Step 1: Install the Package

```bash
npm install @nccirtu/tablefy
```

### Step 2: Install Peer Dependencies

```bash
# Core dependencies (required)
npm install @tanstack/react-table lucide-react class-variance-authority clsx tailwind-merge

# Inertia integration (optional - only if using Laravel + Inertia)
npm install @inertiajs/react

# Zod validation (optional - only if using schema validation)
npm install zod
```

### Step 3: Install shadcn/ui Components

Tablefy uses shadcn/ui components. Install them based on what you need:

**For Data Tables:**

```bash
npx shadcn@latest add button table checkbox dropdown-menu input select badge progress tooltip
```

**For Forms (additional components):**

```bash
npx shadcn@latest add label card tabs textarea switch radio-group calendar popover separator
```

**Install everything at once:**

```bash
npx shadcn@latest add button table checkbox dropdown-menu input select badge progress tooltip label card tabs textarea switch radio-group calendar popover separator
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
import react from "@vitejs/plugin-react";
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

## Import Paths

Tablefy provides multiple entry points for tree-shaking:

```tsx
// Main entry - everything
import { DataTable, TableSchema, TextColumn, FormSchema, TextInput } from "@nccirtu/tablefy";

// Columns only
import { TextColumn, BadgeColumn, DateColumn } from "@nccirtu/tablefy/columns";

// Forms only
import { FormSchema, TextInput, Select, FormRenderer } from "@nccirtu/tablefy/forms";

// Inertia integration only (requires @inertiajs/react)
import { useInertiaForm, useServerTable } from "@nccirtu/tablefy/inertia";
```

---

## CLI Commands

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

## Verify Installation

Create a test component to verify everything works:

### Test Data Table

```tsx
import { DataTable, TableSchema, TextColumn } from "@nccirtu/tablefy";

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
  .build();

export function UsersTable() {
  return <DataTable data={users} columns={columns} config={config} />;
}
```

### Test Form

```tsx
import { FormSchema, TextInput, Select, FormRenderer } from "@nccirtu/tablefy/forms";
import { useState } from "react";

type ContactForm = {
  name: string;
  email: string;
  subject: string;
};

const schema = FormSchema.make<ContactForm>()
  .title("Contact Us")
  .columns(2)
  .fields(
    TextInput.make<ContactForm>("name").label("Name").required(),
    TextInput.make<ContactForm>("email").label("Email").email().required(),
    Select.make<ContactForm>("subject")
      .label("Subject")
      .options([
        { value: "support", label: "Support" },
        { value: "sales", label: "Sales" },
        { value: "other", label: "Other" },
      ])
      .columnSpan(2),
  )
  .actions((a) => a.submit({ label: "Send Message" }))
  .build();

export function ContactPage() {
  const [data, setData] = useState<ContactForm>({ name: "", email: "", subject: "" });
  const [errors, setErrors] = useState({});

  return (
    <FormRenderer
      schema={schema}
      data={data}
      errors={errors}
      onChange={(field, value) => setData((prev) => ({ ...prev, [field]: value }))}
      onSubmit={() => console.log("Submitted:", data)}
    />
  );
}
```

---

## Troubleshooting

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
// Correct
import { TableSchema, DataTable } from "@nccirtu/tablefy";
import { TextColumn, BadgeColumn } from "@nccirtu/tablefy/columns";
import { FormSchema, TextInput } from "@nccirtu/tablefy/forms";
import { useInertiaForm } from "@nccirtu/tablefy/inertia";

// Wrong - useInertiaForm is not in /forms
import { useInertiaForm } from "@nccirtu/tablefy/forms";
```

---

## Next Steps

- [Usage Guide](./USAGE.md) - Complete API reference for data tables
- [Forms Guide](./FORMS.md) - Complete forms API with all field types
- [Inertia Integration](./INERTIA.md) - Server-side tables and Inertia form hooks
- [GitHub](https://github.com/nccirtu/Tablefy) - Report issues and contribute
