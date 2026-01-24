# Installation Guide

## Quick Install

Install Tablefy via npm:

```bash
npm install tablefy
```

Or with yarn:

```bash
yarn add tablefy
```

Or with pnpm:

```bash
pnpm add tablefy
```

## Prerequisites

Tablefy is built on top of shadcn/ui components and TanStack Table. You'll need the following peer dependencies:

### Required Dependencies

```bash
npm install @tanstack/react-table lucide-react class-variance-authority clsx tailwind-merge
```

### Framework Requirements

- **React**: 18.0.0 or higher
- **TypeScript**: 5.0.0 or higher (recommended)
- **Tailwind CSS**: 3.0.0 or higher

## Tailwind CSS Configuration

Add the following to your `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/tablefy/**/*.{js,ts,jsx,tsx}", // Add this line
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## TypeScript Configuration

If you're using TypeScript, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "strict": true
  }
}
```

## Path Aliases (Optional)

If you want to use path aliases like `@/components`, add this to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

And configure your bundler accordingly (Vite, Next.js, etc.).

## Verify Installation

Create a simple test component to verify everything is working:

```tsx
import { DataTable, TableSchema, TextColumn } from "tablefy";

type User = {
  id: string;
  name: string;
};

const columns = TableSchema.make<User>()
  .columns(TextColumn.make("name").label("Name"))
  .build();

export function TestTable() {
  const data = [{ id: "1", name: "John Doe" }];
  return <DataTable columns={columns} data={data} />;
}
```

If this renders without errors, you're all set! 🎉

## Troubleshooting

### Module not found errors

If you see errors like `Cannot find module 'tablefy'`:

1. Clear your node_modules and reinstall:

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Restart your development server

### Styling issues

If components don't look right:

1. Ensure Tailwind CSS is properly configured
2. Check that the Tablefy content path is included in `tailwind.config.js`
3. Import Tailwind CSS in your main CSS file:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### TypeScript errors

If you see TypeScript errors:

1. Ensure you're using TypeScript 5.0.0 or higher
2. Check that `strict` mode is enabled in `tsconfig.json`
3. Restart your TypeScript server in your IDE

## Next Steps

- Read the [Usage Guide](./USAGE.md) for detailed examples
- Check out the [Column Types](./USAGE.md#column-types) reference
- Explore [Advanced Features](./USAGE.md#advanced-features)
