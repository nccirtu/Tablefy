# Inertia.js Integration

Complete guide to using Tablefy with Laravel + Inertia.js v2 + Wayfinder. This module provides hooks that bridge Tablefy's schema-driven forms and tables with Inertia's state management and server communication.

## Table of Contents

- [Installation](#installation)
- [useInertiaForm](#useinertiaform)
  - [Basic Usage](#basic-usage)
  - [With Wayfinder Routes](#with-wayfinder-routes)
  - [Edit Forms](#edit-forms)
  - [Hook API Reference](#hook-api-reference)
- [useServerTable](#useservertable)
  - [Basic Server-Side Table](#basic-server-side-table)
  - [With Search and Filters](#with-search-and-filters)
  - [Laravel Controller Example](#laravel-controller-example)
  - [Hook API Reference](#hook-api-reference-1)
- [Precognition (Live Validation)](#precognition-live-validation)
- [Full Examples](#full-examples)

---

## Installation

```bash
# Install Tablefy
npm install @nccirtu/tablefy

# Install Inertia.js (required peer dependency for this module)
npm install @inertiajs/react

# Install Wayfinder (optional, for type-safe routes)
# Follow Laravel Wayfinder setup: https://github.com/laravel/wayfinder
```

Import from the `/inertia` sub-path:

```tsx
import { useInertiaForm, useServerTable, createPrecognitionBlur } from "@nccirtu/tablefy/inertia";
```

---

## useInertiaForm

The `useInertiaForm` hook bridges `FormSchema` with Inertia's `useForm`. It:

- Computes default values from your schema field configs
- Wraps Inertia's `useForm` for state management
- Maps `form.setData()` to `onChange`
- Maps `form[method](url)` to `onSubmit`
- Passes through `form.errors` and `form.processing`

### Basic Usage

```tsx
import { FormSchema, TextInput, Select, FormRenderer } from "@nccirtu/tablefy/forms";
import { useInertiaForm } from "@nccirtu/tablefy/inertia";

type CreateUser = {
  name: string;
  email: string;
  role: string;
};

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
        { value: "viewer", label: "Viewer" },
      ])
      .required()
      .columnSpan(2),
  )
  .actions((a) =>
    a
      .submit({ label: "Create User" })
      .cancel({ label: "Cancel", href: "/users" })
  )
  .build();

export default function CreateUserPage() {
  const { data, errors, onChange, onSubmit, processing } = useInertiaForm<CreateUser>({
    schema,
    url: "/users",
    method: "post",
    onSuccess: () => {
      // Inertia will handle the redirect from Laravel
    },
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

### With Wayfinder Routes

If you're using [Laravel Wayfinder](https://github.com/laravel/wayfinder) for type-safe route helpers:

```tsx
// Wayfinder generates typed route helpers from your Laravel routes
import { storeUser } from "@/actions/UserController";
import { indexUsers } from "@/actions/UserController";

export default function CreateUserPage() {
  const { data, errors, onChange, onSubmit, processing } = useInertiaForm<CreateUser>({
    schema,
    url: storeUser().url,    // Type-safe route URL
    method: "post",
    onSuccess: () => {
      // Redirect handled by Laravel
    },
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

### Edit Forms

For edit forms, pass `initialData` to pre-populate the form with existing values:

```tsx
import { FormSchema, TextInput, Select, FormRenderer } from "@nccirtu/tablefy/forms";
import { useInertiaForm } from "@nccirtu/tablefy/inertia";

type EditUser = {
  name: string;
  email: string;
  role: string;
};

const schema = FormSchema.make<EditUser>()
  .title((data) => `Edit ${data.name}`)
  .columns(2)
  .fields(
    TextInput.make<EditUser>("name").label("Name").required(),
    TextInput.make<EditUser>("email").label("Email").email().required(),
    Select.make<EditUser>("role")
      .label("Role")
      .options([
        { value: "admin", label: "Admin" },
        { value: "editor", label: "Editor" },
        { value: "viewer", label: "Viewer" },
      ])
      .columnSpan(2),
  )
  .actions((a) =>
    a
      .submit({ label: "Update User" })
      .cancel({ label: "Cancel", href: "/users" })
  )
  .build();

// Inertia page component receives props from Laravel
export default function EditUserPage({ user }: { user: EditUser & { id: number } }) {
  const { data, errors, onChange, onSubmit, processing } = useInertiaForm<EditUser>({
    schema,
    initialData: user,                // Pre-populate with existing data
    url: `/users/${user.id}`,
    method: "put",
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

### Hook API Reference

```tsx
const result = useInertiaForm<TData>(options);
```

**Options:**

| Option | Type | Required | Description |
|---|---|---|---|
| `schema` | `FormBuildResult<TData>` | Yes | Built schema from `FormSchema.build()` |
| `initialData` | `Partial<TData>` | No | Initial form data (overrides field defaults) |
| `url` | `string` | No | Submission URL |
| `method` | `"post" \| "put" \| "patch" \| "delete"` | No | HTTP method (default: `"post"`) |
| `onSuccess` | `() => void` | No | Callback after successful submission |
| `onError` | `(errors) => void` | No | Callback on validation errors |
| `onBefore` | `() => void` | No | Callback before submission |
| `onFinish` | `() => void` | No | Callback after submission (success or error) |
| `preserveScroll` | `boolean` | No | Preserve scroll position |

**Return value:**

| Property | Type | Description |
|---|---|---|
| `data` | `TData` | Current form data |
| `errors` | `Partial<Record<keyof TData, string>>` | Server validation errors |
| `onChange` | `(field, value) => void` | Change handler for FormRenderer |
| `onSubmit` | `() => void` | Submit handler for FormRenderer |
| `processing` | `boolean` | True while form is submitting |
| `form` | `InertiaForm` | Raw Inertia form object for advanced usage |

---

## useServerTable

The `useServerTable` hook provides server-side pagination, sorting, and filtering for data tables. It manages URL state and calls `router.visit()` with query parameters in a Laravel-compatible format.

### Basic Server-Side Table

```tsx
import { DataTable, TableSchema, TextColumn, BadgeColumn, DateColumn } from "@nccirtu/tablefy";
import { useServerTable } from "@nccirtu/tablefy/inertia";

type User = {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  created_at: string;
};

// Laravel paginated response (from Inertia page props)
type Props = {
  users: {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

const columns = TableSchema.make<User>()
  .columns(
    TextColumn.make("name").label("Name").sortable(),
    TextColumn.make("email").label("Email"),
    BadgeColumn.make("status").label("Status").variants({
      active: "success",
      inactive: "secondary",
    }),
    DateColumn.make("created_at").label("Created").relative(),
  )
  .build();

export default function UsersIndex({ users }: Props) {
  const table = useServerTable({
    url: "/users",
    defaultPageSize: 15,
    only: ["users"],     // Only reload the 'users' prop (Inertia partial reload)
  });

  return (
    <DataTable
      columns={columns}
      data={users.data}
      config={{
        search: {
          enabled: true,
          value: table.state.search,
          onSearch: table.setSearch,
        },
        pagination: {
          enabled: true,
          pageSize: users.per_page,
          currentPage: users.current_page,
          totalPages: users.last_page,
          totalItems: users.total,
          onPageChange: table.setPage,
          onPageSizeChange: table.setPerPage,
        },
      }}
    />
  );
}
```

### With Search and Filters

```tsx
export default function UsersIndex({ users }: Props) {
  const table = useServerTable({
    url: "/users",
    defaultSort: { id: "name", desc: false },
    defaultPageSize: 25,
    debounce: 300,       // Debounce search input by 300ms
    only: ["users"],
  });

  return (
    <DataTable
      columns={columns}
      data={users.data}
      config={{
        search: {
          enabled: true,
          placeholder: "Search users...",
          value: table.state.search,
          onSearch: table.setSearch,
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
            value: table.state.filters.status,
            onChange: (value) => table.setFilter("status", value),
          },
        ],
        pagination: {
          enabled: true,
          pageSize: users.per_page,
          currentPage: users.current_page,
          totalPages: users.last_page,
          totalItems: users.total,
          onPageChange: table.setPage,
          onPageSizeChange: table.setPerPage,
        },
      }}
    />
  );
}
```

### Laravel Controller Example

The hook sends query parameters in a Laravel-compatible format. Here's how to handle them in your controller:

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            // Search
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            // Sort
            ->when($request->sort, function ($query) use ($request) {
                $query->orderBy(
                    $request->sort,
                    $request->direction ?? 'asc'
                );
            }, function ($query) {
                $query->latest(); // Default sort
            })
            // Filters
            ->when($request->input('filter.status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->input('filter.role'), function ($query, $role) {
                $query->where('role', $role);
            })
            // Pagination
            ->paginate(
                perPage: $request->per_page ?? 15,
                page: $request->page ?? 1,
            );

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }
}
```

**Query parameters sent by useServerTable:**

| Parameter | Format | Example |
|---|---|---|
| Search | `?search=john` | `?search=john` |
| Sort column | `?sort=name` | `?sort=created_at` |
| Sort direction | `?direction=asc` | `?direction=desc` |
| Page | `?page=2` | `?page=3` |
| Per page | `?per_page=25` | `?per_page=50` |
| Filters | `?filter[key]=value` | `?filter[status]=active` |

### Hook API Reference

```tsx
const table = useServerTable(config);
```

**Config:**

| Option | Type | Default | Description |
|---|---|---|---|
| `url` | `string` | Required | Base URL for the page |
| `defaultSort` | `{ id: string, desc: boolean }` | `null` | Default sort column and direction |
| `defaultPageSize` | `number` | `15` | Default items per page |
| `debounce` | `number` | `300` | Search debounce delay in ms |
| `preserveState` | `boolean` | `true` | Preserve component state on navigation |
| `preserveScroll` | `boolean` | `true` | Preserve scroll position on navigation |
| `only` | `string[]` | `undefined` | Props to reload (Inertia partial reloads) |

**Return value:**

| Property | Type | Description |
|---|---|---|
| `state` | `ServerTableState` | Current table state |
| `state.search` | `string` | Current search query |
| `state.sort` | `{ id, desc } \| null` | Current sort |
| `state.page` | `number` | Current page number |
| `state.perPage` | `number` | Items per page |
| `state.filters` | `Record<string, any>` | Active filters |
| `setSearch(query)` | `(string) => void` | Update search (debounced) |
| `setSort(sort)` | `(sort \| null) => void` | Update sort column/direction |
| `setPage(page)` | `(number) => void` | Go to page |
| `setPerPage(n)` | `(number) => void` | Change items per page |
| `setFilter(key, value)` | `(string, any) => void` | Set a filter value |
| `resetFilters()` | `() => void` | Clear all filters |

---

## Precognition (Live Validation)

Laravel Precognition allows real-time server-side validation as users fill out forms. Tablefy provides `createPrecognitionBlur` to wire field `onBlur` events to Precognition validation.

### Setup

1. Add the `HandlePrecognitiveRequests` middleware to your Laravel route:

```php
// routes/web.php
Route::post('/users', [UserController::class, 'store'])
    ->middleware('precognitive');
```

2. Use `createPrecognitionBlur` in your form component:

```tsx
import { FormSchema, TextInput, FormRenderer } from "@nccirtu/tablefy/forms";
import { useInertiaForm, createPrecognitionBlur } from "@nccirtu/tablefy/inertia";

type CreateUser = {
  name: string;
  email: string;
};

const schema = FormSchema.make<CreateUser>()
  .fields(
    TextInput.make<CreateUser>("name").label("Name").required(),
    TextInput.make<CreateUser>("email").label("Email").email().required(),
  )
  .actions((a) => a.submit({ label: "Create" }))
  .build();

export default function CreateUserPage() {
  const { data, errors, onChange, onSubmit, processing, form } =
    useInertiaForm<CreateUser>({
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
      onBlur={(fieldName) => {
        // Validate the field on the server when the user leaves it
        const handler = createPrecognitionBlur(form, fieldName);
        handler?.();
      }}
    />
  );
}
```

This validates each field on the server as the user tabs away, showing real-time validation errors without submitting the form.

---

## Full Examples

### Complete CRUD: Users

**Laravel Controller:**

```php
class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->search, fn ($q, $s) =>
                $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")
            )
            ->when($request->sort, fn ($q) =>
                $q->orderBy($request->sort, $request->direction ?? 'asc'),
                fn ($q) => $q->latest()
            )
            ->when($request->input('filter.role'), fn ($q, $r) => $q->where('role', $r))
            ->paginate($request->per_page ?? 15);

        return Inertia::render('Users/Index', ['users' => $users]);
    }

    public function create()
    {
        return Inertia::render('Users/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email|unique:users',
            'role' => 'required|in:admin,editor,viewer',
        ]);

        User::create($request->all());

        return redirect()->route('users.index');
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', ['user' => $user]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,editor,viewer',
        ]);

        $user->update($request->all());

        return redirect()->route('users.index');
    }
}
```

**Index Page (Server-Side Table):**

```tsx
// resources/js/Pages/Users/Index.tsx
import { DataTable, TableSchema, TextColumn, BadgeColumn, ActionsColumn, DateColumn } from "@nccirtu/tablefy";
import { useServerTable } from "@nccirtu/tablefy/inertia";
import { router } from "@inertiajs/react";
import { confirm } from "@nccirtu/tablefy";

type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  created_at: string;
};

const columns = TableSchema.make<User>()
  .columns(
    TextColumn.make("name").label("Name").sortable(),
    TextColumn.make("email").label("Email"),
    BadgeColumn.make("role").label("Role").variants({
      admin: "destructive",
      editor: "default",
      viewer: "secondary",
    }),
    DateColumn.make("created_at").label("Joined").relative(),
    ActionsColumn.make<User>()
      .edit((row) => router.visit(`/users/${row.id}/edit`))
      .action({
        label: "Delete",
        variant: "destructive",
        onClick: async (row) => {
          const ok = await confirm({
            title: "Delete User?",
            description: `Are you sure you want to delete ${row.name}?`,
            variant: "destructive",
          });
          if (ok) router.delete(`/users/${row.id}`);
        },
      }),
  )
  .build();

export default function UsersIndex({ users }: { users: any }) {
  const table = useServerTable({
    url: "/users",
    defaultPageSize: 15,
    only: ["users"],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      <DataTable
        columns={columns}
        data={users.data}
        config={{
          search: {
            enabled: true,
            placeholder: "Search users...",
            value: table.state.search,
            onSearch: table.setSearch,
          },
          filters: [
            {
              id: "role",
              label: "Role",
              type: "select",
              column: "role",
              options: [
                { label: "Admin", value: "admin" },
                { label: "Editor", value: "editor" },
                { label: "Viewer", value: "viewer" },
              ],
              value: table.state.filters.role,
              onChange: (v) => table.setFilter("role", v),
            },
          ],
          pagination: {
            enabled: true,
            currentPage: users.current_page,
            totalPages: users.last_page,
            totalItems: users.total,
            pageSize: users.per_page,
            onPageChange: table.setPage,
            onPageSizeChange: table.setPerPage,
          },
          headerActions: [
            {
              id: "create",
              label: "Add User",
              onClick: () => router.visit("/users/create"),
            },
          ],
        }}
      />
    </div>
  );
}
```

**Create Page (Form with Inertia):**

```tsx
// resources/js/Pages/Users/Create.tsx
import { FormSchema, TextInput, Select, FormRenderer } from "@nccirtu/tablefy/forms";
import { useInertiaForm } from "@nccirtu/tablefy/inertia";

type CreateUser = {
  name: string;
  email: string;
  role: string;
};

const schema = FormSchema.make<CreateUser>()
  .title("Create User")
  .description("Add a new team member")
  .columns(2)
  .bordered()
  .fields(
    TextInput.make<CreateUser>("name").label("Name").required().maxLength(255),
    TextInput.make<CreateUser>("email").label("Email").email().required(),
    Select.make<CreateUser>("role")
      .label("Role")
      .options([
        { value: "admin", label: "Admin" },
        { value: "editor", label: "Editor" },
        { value: "viewer", label: "Viewer" },
      ])
      .required()
      .columnSpan(2),
  )
  .actions((a) =>
    a
      .submit({ label: "Create User" })
      .cancel({ label: "Cancel", href: "/users" })
  )
  .build();

export default function CreateUserPage() {
  const { data, errors, onChange, onSubmit, processing } = useInertiaForm<CreateUser>({
    schema,
    url: "/users",
    method: "post",
  });

  return (
    <div className="mx-auto max-w-2xl py-8">
      <FormRenderer
        schema={schema}
        data={data}
        errors={errors}
        onChange={onChange}
        onSubmit={onSubmit}
        processing={processing}
      />
    </div>
  );
}
```

**Edit Page:**

```tsx
// resources/js/Pages/Users/Edit.tsx
import { FormSchema, TextInput, Select, FormRenderer } from "@nccirtu/tablefy/forms";
import { useInertiaForm } from "@nccirtu/tablefy/inertia";

type EditUser = {
  name: string;
  email: string;
  role: string;
};

const schema = FormSchema.make<EditUser>()
  .title((data) => `Edit ${data.name}`)
  .columns(2)
  .bordered()
  .fields(
    TextInput.make<EditUser>("name").label("Name").required().maxLength(255),
    TextInput.make<EditUser>("email").label("Email").email().required(),
    Select.make<EditUser>("role")
      .label("Role")
      .options([
        { value: "admin", label: "Admin" },
        { value: "editor", label: "Editor" },
        { value: "viewer", label: "Viewer" },
      ])
      .columnSpan(2),
  )
  .actions((a) =>
    a
      .submit({ label: "Update User" })
      .cancel({ label: "Cancel", href: "/users" })
  )
  .build();

export default function EditUserPage({ user }: { user: EditUser & { id: number } }) {
  const { data, errors, onChange, onSubmit, processing } = useInertiaForm<EditUser>({
    schema,
    initialData: user,
    url: `/users/${user.id}`,
    method: "put",
  });

  return (
    <div className="mx-auto max-w-2xl py-8">
      <FormRenderer
        schema={schema}
        data={data}
        errors={errors}
        onChange={onChange}
        onSubmit={onSubmit}
        processing={processing}
      />
    </div>
  );
}
```

---

## PaginatedResponse Type

The `PaginatedResponse` type matches Laravel's default pagination format:

```tsx
import type { PaginatedResponse } from "@nccirtu/tablefy/inertia";

// Matches Laravel's User::paginate() output
type Props = {
  users: PaginatedResponse<User>;
};

// PaginatedResponse<T> = {
//   data: T[];
//   current_page: number;
//   last_page: number;
//   per_page: number;
//   total: number;
//   from: number | null;
//   to: number | null;
// }
```

---

## Next Steps

- [Forms Guide](./FORMS.md) - All field types and form layout options
- [Data Tables](./USAGE.md) - Column types and table configuration
- [Installation](./INSTALLATION.md) - Setup guide
