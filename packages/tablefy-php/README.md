# Tablefy for Laravel

Laravel companion for [`@nccirtu/tablefy`](https://github.com/nccirtu/Tablefy): a resource
generator, a generic CRUD controller, and a server-side table query helper for Inertia.

> Status: developed alongside the npm package under `packages/tablefy-php/`. Intended to be
> published separately as `nccirtu/tablefy-php`. **Not yet tested against a live Laravel
> app** — try it and report.

## Install

```bash
composer require nccirtu/tablefy-php
```

The service provider auto-registers. Make sure the frontend package is installed too
(`npm install @nccirtu/tablefy`) and that your Inertia pages resolve from `resources/js/pages`.

## Generate a resource

```bash
# 1) You create the model + migration as usual, then:
php artisan make:tablefy-resource Customer --generate
```

`--generate` reads the model's table and pre-fills the TS type, table columns, form fields
and validation rules. Without it you get a scaffold with TODO placeholders.

It creates:

```
resources/js/types/tablefy/customer.ts                     @generated
resources/js/pages/tablefy/Customers/
  ├── CustomerResource.tsx                                  @generated
  ├── Pages/{ListCustomers,CreateCustomer,EditCustomer}.tsx @generated
  ├── Tables/CustomersTable.tsx                             editable (kept on re-run)
  └── Schemas/CustomerForm.tsx                              editable (kept on re-run)
app/Http/Controllers/Tablefy/CustomerController.php         @generated
routes/tablefy.php                                          (route appended)
```

Then wire the routes once:

```php
// routes/web.php
require __DIR__.'/tablefy.php';
```

Re-running the command overwrites the `@generated` files but **keeps** your edited
`Tables/` and `Schemas/` (use `--force` to overwrite those too).

## Server-side queries

The package adds an Eloquent `tablefy()` macro used by the generated controller:

```php
Customer::query()->tablefy($request)->paginate(15);
```

It applies `?search=`, `?filter[col]=`, `?sort=&direction=` from the request, each guarded by
a static whitelist on the model:

```php
class Customer extends Model
{
    public static array $tablefySearchable = ['name', 'email'];
    public static array $tablefySortable   = ['name', 'created_at'];
    public static array $tablefyFilterable = ['status'];
}
```

## Navigation (sidebar)

Resources appear in your sidebar automatically. The package scans the registered routes
(every `*.index` of a `TablefyController`) and shares the navigation with each Inertia
response as `props.tablefy.navigation` — route-cache safe, no manual list.

**1) Declare nav attributes on the controller** (`app/Http/Controllers/Tablefy/UserController.php`):

```php
class UserController extends TablefyController
{
    // …

    protected ?string $navigationLabel = 'Users';   // default: the plural name
    protected ?string $navigationIcon  = 'users';   // a lucide icon name
    protected ?string $navigationGroup = null;       // optional group heading
    protected int     $navigationSort  = 0;          // lower = higher up

    public function navigationBadge(): ?string       // optional live badge
    {
        return (string) \App\Models\User::count();
    }
}
```

(The generator already writes these for new resources.)

**2) Feed it into your sidebar** — the package gives you the data, your app renders it, so it
matches your design. In `components/app-sidebar.tsx`:

> ⚠️ `useTablefyNav()` is a **React hook** — call it **inside** the `AppSidebar` component, not
> at module level. The starter kit declares `mainNavItems` as a module-level `const`; keep that
> for your static items and combine at render time:

```tsx
import { useTablefyNav } from "@nccirtu/tablefy/inertia";
import type { NavItem } from "@/types";

// static items stay at module level
const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
];

export function AppSidebar() {
    const tablefyNav = useTablefyNav();   // ← hook: inside the component
    return (
        // …
        <NavMain items={[...mainNavItems, ...tablefyNav]} />
        // …
    );
}
```

`useTablefyNav()` resolves the icon name to a `LucideIcon` via a small curated map; pass
`useTablefyNav({ resolveIcon })` for icons outside it. `useTablefyNavGroups()` groups by
`navigationGroup`. The package never renders the sidebar itself.

> When developing against a **linked/symlinked** copy of this package (npm `link` / `file:`),
> two `@types/react` copies exist, so TS may complain about the `icon` type — cast it
> (`...(useTablefyNav() as NavItem[])`). This is a symlink-only artifact and does not occur with
> a normal npm install.

### Grouped data (optional)

`useTablefyNavGroups()` returns the same items grouped by `$navigationGroup` as
`{ group, items }[]` — a **data helper** only, in case you want to render group headings with
your own sidebar primitives. The package ships no sidebar component; you stay in control of
rendering (just like the flat `useTablefyNav()` above).

## Customizing the stubs

```bash
php artisan vendor:publish --tag=tablefy-stubs
```

Edits to `stubs/tablefy/*.stub` take precedence over the package defaults.
