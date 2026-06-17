# Tablefy

Schema-getriebenes, typsicheres React-Toolkit für **Data Tables** und **Formulare** —
gebaut auf [TanStack Table](https://tanstack.com/table) und [shadcn/ui](https://ui.shadcn.com/),
ausgelegt für **Laravel + Inertia.js v2 + Wayfinder**. Fluent, chainable Builder-API.

```bash
npm install @nccirtu/tablefy
```

> 📖 **Vollständige Doku: [`docs/GUIDE.md`](https://github.com/nccirtu/Tablefy/blob/main/docs/GUIDE.md)** — die einzige Quelle der
> Wahrheit dafür, wie das Package funktioniert (Installation, alle Spalten- & Feldtypen,
> Server-Modus, Filter, Inertia, CLI, Styling).

## Features

- **Data Tables** — ~17 Spaltentypen, Suche, Filter, Sortierung, Pagination (client- **und**
  serverseitig), Spalten-Sichtbarkeit, Zeilenauswahl, Confirm-Dialoge.
- **Formulare** — 13 Feldtypen, Sections/Tabs/Wizard-Layouts, Field-Dependencies,
  Grid-Layout, Validierung.
- **Inertia** — `useInertiaForm`, `useServerTable`, `ServerDataTable` (deklarativer
  Server-Modus in einer Zeile), Precognition, Wayfinder.
- **Typsicher & Tree-Shakeable** — generisch über `<T>`, Sub-Path-Exports
  (`/columns`, `/forms`, `/inertia`).

## Quick Start

```tsx
import { DataTable, TableSchema, TextColumn, BadgeColumn } from "@nccirtu/tablefy";

type User = { id: number; name: string; status: "active" | "inactive" };

const users = TableSchema.make<User>()
  .searchable()
  .paginated({ pageSize: 15 })
  .columns(
    TextColumn.make<User>("name").label("Name").sortable(),
    BadgeColumn.make<User>("status").variants({ active: "success", inactive: "secondary" }),
  )
  .build();

<DataTable data={data} columns={users.columns} config={users.config} />
```

Server-Modus (Laravel + Inertia), eine Zeile:

```tsx
import { ServerDataTable } from "@nccirtu/tablefy/inertia";

<ServerDataTable schema={users} paginator={props.users} url="/users" />
```

## Import-Pfade

```tsx
import { DataTable, TableSchema, TextColumn } from "@nccirtu/tablefy";        // alles
import { TextColumn, SelectFilter } from "@nccirtu/tablefy/columns";          // Spalten/Filter
import { FormSchema, TextInput, FormRenderer } from "@nccirtu/tablefy/forms"; // Formulare
import { useInertiaForm, ServerDataTable } from "@nccirtu/tablefy/inertia";   // Inertia
```

## Beispiel-Resource

Eine vollständige CRUD-Resource (Backend → Frontend) liegt unter
[`examples/customers/`](https://github.com/nccirtu/Tablefy/tree/main/examples/customers).

## Doku & weiteres

- **[Package Guide](https://github.com/nccirtu/Tablefy/blob/main/docs/GUIDE.md)** — vollständige Referenz
- [Changelog](./CHANGELOG.md)

## Lizenz

MIT
