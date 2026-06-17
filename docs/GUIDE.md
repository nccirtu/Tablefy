<!--
  ════════════════════════════════════════════════════════════════════════
  TABLEFY — PACKAGE GUIDE  ·  Single Source of Truth
  Diese Datei erklärt, wie das gesamte Package funktioniert.
  ‼️  WICHTIG: Bei JEDER Änderung am Package MUSS diese Datei mitgepflegt
      werden (neue/­geänderte APIs, Spalten, Felder, Builder, Verhalten).
  ════════════════════════════════════════════════════════════════════════
-->

# Tablefy — Package Guide

`@nccirtu/tablefy` ist ein schema-getriebenes, typsicheres React-Toolkit für
**Data Tables** und **Formulare**, gebaut auf [TanStack Table](https://tanstack.com/table)
und [shadcn/ui](https://ui.shadcn.com/), ausgelegt für **Laravel + Inertia.js v2 + Wayfinder**.
Die API ist fluent/chainable (`TableSchema.make<T>()...build()`).

Leitidee: Du beschreibst Tabellen & Formulare als **Schema**, das Package liefert die
gesamte UI. Alles ist generisch typisiert über `<T>`.

---

## 1. Architektur & Import-Pfade

Das Package ist in **Sub-Path-Exports** geteilt (Tree-Shaking):

| Import | Inhalt |
|---|---|
| `@nccirtu/tablefy` | Alles: Tabellen, Spalten, Builder, Filter, Confirm + Re-Export der Forms |
| `@nccirtu/tablefy/columns` | Nur Spalten-Builder (ohne Tabellen-Runtime) |
| `@nccirtu/tablefy/forms` | Nur Formulare (ohne TanStack Table) |
| `@nccirtu/tablefy/inertia` | Inertia-Integration (benötigt `@inertiajs/react`) |

Quellstruktur (`src/`):

```
tablefy/   DataTable + Header, Pagination, Filter-UI, Empty-State
columns/   ~17 Spaltentypen auf gemeinsamer BaseColumn
builders/  TableSchema, EmptyStateBuilder, Filter-Builder
forms/     FormSchema, 13 Feldtypen, Layout-Builder, Renderer
inertia/   useInertiaForm, useServerTable, ServerDataTable, Precognition
confirm/   confirm() + ConfirmProvider
components/ui, lib/  (vendored UI-Primitives, ins dist gebundelt – siehe §10)
```

---

## 2. Installation

> Zielumgebung: **Laravel 13 + Inertia v3 + React 19 + Tailwind v4** (PHP 8.3+).

```bash
# Das war's – alle UI-Primitives sind im Package gebundelt.
npm install @nccirtu/tablefy

# Peer-Dependency (vom Host-Projekt bereitgestellt):
npm install @tanstack/react-table

# Optional: Inertia-Integration / Zod-Validierung
npm install @inertiajs/react zod
```

**Kein shadcn-Setup, kein `@/`-Alias, keine 18 Einzelinstallationen mehr.** Radix, lucide,
clsx, cva, tailwind-merge zieht npm automatisch als `dependencies`.

**Tailwind v4** (`resources/css/app.css`):

```css
@import "tailwindcss";
@import "@nccirtu/tablefy/styles.css";               /* Default-Design-Tokens */
@source "../../node_modules/@nccirtu/tablefy/dist";  /* Klassen scannen */
```

Tokens überschreibst du danach im eigenen Stylesheet (§9) – Komponenten-Code nie anfassen.

---

## 3. Tabellen

### 3.1 Schema definieren

```tsx
import { TableSchema, TextColumn, BadgeColumn, NumberColumn } from "@nccirtu/tablefy";

type User = { id: number; name: string; status: "active" | "inactive"; total: number };

export const usersTable = TableSchema.make<User>()
  .title("Benutzer")
  .searchable({ placeholder: "Suchen…" })
  .sortable({ id: "name", desc: false })
  .paginated({ pageSize: 15, pageSizeOptions: [15, 30, 50] })
  .selectable()            // Mehrfachauswahl
  .columnVisibility()
  .striped()
  .columns(
    TextColumn.make<User>("name").label("Name").sortable(),
    BadgeColumn.make<User>("status").variants({ active: "success", inactive: "secondary" }),
    NumberColumn.make<User>("total").money("EUR"),
  )
  .build(); // → { columns, config }
```

### 3.2 `TableSchema`-Methoden

| Methode | Wirkung |
|---|---|
| `title(t)` / `description(t)` | Kopfzeile |
| `headerActions(actions)` | Buttons im Header (Array von `HeaderAction`) |
| `searchable(cfg?)` | Suche; `cfg = { placeholder } \| boolean` |
| `sortable(defaultSort?)` | Sortierung aktivieren, optional Default `{ id, desc }` |
| `paginated(cfg?)` | Pagination; `{ pageSize, pageSizeOptions } \| boolean` |
| `selectable(multi=true)` | Zeilenauswahl (Checkbox-Spalte) |
| `columnVisibility(on=true)` | Spalten ein-/ausblendbar |
| `filters(...f)` | Filter (Builder **oder** `FilterConfig`); siehe §3.6 |
| `bordered/striped/hoverable(on)` | Styling |
| `density("compact"\|"default"\|"comfortable")` | Zeilenhöhe |
| `emptyState/searchEmptyState/filterEmptyState(cfg)` | Leerzustände |
| `columns(...builders)` | Spalten |
| `build()` | `{ columns, config }` |

### 3.3 Tabelle rendern

```tsx
import { DataTable } from "@nccirtu/tablefy";

<DataTable data={users} columns={usersTable.columns} config={usersTable.config} />
```

`DataTable`-Props: `columns`, `data`, `config`, `className`, `isLoading`, `isError`,
`onRetry`, **`server`** (siehe §3.5).

**Toolbar-Layout (shadcn-Standard):** Suche links; rechts (`justify-between`) ein Cluster
**[Spalten ▾] [Filter ▾] [⋯ Header-Actions]**. Die **Spaltenauswahl ist standardmäßig an**
(abschaltbar via `.columnVisibility(false)`) und zeigt die **Column-Labels** im Select
(`meta.visibilityLabel`, aus `.label()`). Filter kommen aus `.filters([...])` (eigene/Custom-Filter
via `SelectFilter`/`TextFilter`/… Builder). `.headerActions([...])` landen im 3-Punkte-Dropdown.
**Bulk-Actions** erscheinen als **eigene Zeile unter der Suche** (1 → Button, ≥2 → „Aktionen"-Dropdown).

### 3.4 Spaltentypen

Alle Spalten erben **Basis-Methoden**: `label`, `sortable`, `searchable`, `hidden`,
`visibleByDefault`, `visibilityLabel`, `alignLeft/Center/Right`, `width`, `className`,
`headerClassName`, `cellClassName`. Erzeugung immer `Column.make<T>("feld")`.

| Spalte | Spezifische Methoden |
|---|---|
| `TextColumn` | `prefix`, `suffix`, `placeholder`, `uppercase`, `lowercase`, `limit(chars)` |
| `NumberColumn` | `money(cur="EUR")`, `percent`, `decimals(n)`, `locale`, `prefix`, `suffix` |
| `DateColumn` | `short`, `long`, `relative`, `time`, `datetime`, `format(...)`, `locale`, `withIcon` |
| `BadgeColumn` | `variants(map)`, `boolean(trueLabel, falseLabel)`, `status(map)` |
| `LinkColumn` | `urlFromField(field)`, `external`, `openInNewTab`, `underline(...)`, `icon`, `showExternalIcon` |
| `ProgressColumn` | `max`, `showValue`, `showPercentage`, `size`, `color`, `colorByThreshold(w,d)`, `colorByThresholdInverse` |
| `AvatarGroupColumn` | `fields({src,name,fallback})`, `maxVisible`, `size`, `overlap`, `noOverlap`, `showNames`, `hideTooltip` |
| `IconColumn` | `states(map)`, `state(v,cfg)`, `default(icon,label?)`, Presets: `verification`, `activeInactive`, `onlineStatus`, `priority`; `size`, `showLabel`, `withBackground` |
| `ImageColumn` | `size`, `rounded(...)`, `circular`, `square`, `fallback(url)` |
| `EnumColumn` | `options(EnumOption[])`, `asText`, `asBadge`, `showIcon/hideIcon`, `iconPosition`, `placeholder` |
| `CheckboxColumn` | `make<T>()` (Auswahl, kein Accessor) |
| `ActionsColumn` | `view(fn)`, `edit(fn)`, `delete(fn)`, `link(label,hrefFn)`, `action(item)`, `separator`, `label`, `triggerIcon` |
| `InputColumn` (editierbar) | `type`, `email/number/password/url`, `placeholder`, `debounce`, `onSave`, `onChange` |
| `SelectColumn` (editierbar) | `options`, `placeholder`, `onValueChange`, `disabled` |

> **Legacy:** `ButtonColumn`/`DropdownColumn` nutzen noch die alte Funktions-API
> (`ButtonColumn({ ... })`, ohne `.build()`) und sind **nicht** mit `TableSchema.columns()`
> kompatibel. Für neue Tabellen `ActionsColumn` verwenden.

### 3.5 Client- vs. Server-Modus

**Client-Modus (Default):** Daten liegen komplett im Browser; Suche/Sortierung/Pagination
laufen via TanStack lokal. Ideal für kleine/eingebettete Listen.

```tsx
<DataTable data={array} columns={t.columns} config={t.config} />
```

**Server-Modus:** Für große Datenmengen. Suche/Sortierung/Pagination/Filter laufen im Backend.
Du übergibst den `server`-Prop = Rückgabe von `useServerTable` + Paginator-`meta`:

```tsx
import { useServerTable } from "@nccirtu/tablefy/inertia";

const server = useServerTable({ url: "/users", defaultPageSize: 15 });
<DataTable data={users.data} columns={t.columns} config={t.config}
  server={{ ...server, meta: users }} />
```

Im Server-Modus setzt `DataTable` intern `manualSorting/Filtering/Pagination`, Pagination
zeigt echte `from–to von total`, Sort-Klicks/Suche/Filter lösen `router.visit` aus.

**Empfohlen:** Statt selbst zu verkabeln die deklarative Komponente **`ServerDataTable`**
(siehe §5.3) – das ist der deklarative Ein-Zeiler.

### 3.6 Filter

Filter werden am Schema deklariert und als Popover im Header gerendert (mit Aktiv-Zähler
und „Zurücksetzen"). Sie funktionieren in **beiden** Modi (server: `setFilter`, client:
TanStack-Column-Filter).

```tsx
import { TableSchema, SelectFilter, TernaryFilter, DateFilter } from "@nccirtu/tablefy";

TableSchema.make<User>()
  .filters(
    SelectFilter.make("status").label("Status").options([
      { value: "active", label: "Aktiv" },
      { value: "inactive", label: "Inaktiv" },
    ]),
    SelectFilter.make("roles").label("Rollen").multiple().options([...]), // multi-select
    TernaryFilter.make("verified").label("Verifiziert").labels("Ja", "Nein"),
    DateFilter.make("created_at").label("Erstellt").range(),              // date-range
  )
  .columns(/* … */)
  .build();
```

Filter-Builder: `SelectFilter` (`.options`, `.multiple`), `TernaryFilter` (`.labels`),
`TextFilter`, `DateFilter` (`.range`). Alle haben `.label` und `.placeholder`. Alternativ
akzeptiert `.filters()` auch rohe `FilterConfig`-Objekte.

Backend-Vertrag siehe §5.4.

### 3.7 Empty States & Confirm

- Leerzustände automatisch (kein Daten / keine Suchtreffer / keine Filtertreffer / Fehler),
  überschreibbar via `emptyState(...)` / `EmptyStateBuilder`.
- **Confirm-Dialoge** für destruktive Aktionen:

```tsx
import { ConfirmProvider, confirm } from "@nccirtu/tablefy";

// einmal um die App:  <ConfirmProvider><App/></ConfirmProvider>
const ok = await confirm({ title: "Löschen?", description: "…", variant: "destructive" });
if (ok) router.delete(`/users/${id}`);
```

---

## 4. Formulare

Import aus `@nccirtu/tablefy/forms` (oder Re-Export aus `@nccirtu/tablefy`).

```tsx
import { FormSchema, TextInput, Select, Textarea, FormRenderer } from "@nccirtu/tablefy/forms";

type CreateUser = { name: string; email: string; role: string; bio: string };

const schema = FormSchema.make<CreateUser>()
  .title("Benutzer anlegen")
  .columns(2)
  .fields(
    TextInput.make<CreateUser>("name").label("Name").required(),
    TextInput.make<CreateUser>("email").label("E-Mail").email().required(),
    Select.make<CreateUser>("role").label("Rolle").options([
      { value: "admin", label: "Admin" }, { value: "editor", label: "Editor" },
    ]).required(),
    Textarea.make<CreateUser>("bio").label("Bio").rows(4).columnSpan(2),
  )
  .actions((a) => a.submit({ label: "Anlegen" }).cancel({ label: "Abbrechen" }))
  .build(); // → { fields, config }
```

### 4.1 `FormSchema`-Methoden
`title`, `description` (beide auch als `(data)=>string`), `columns(n)`, `bordered`,
`spacing`, `disabled`, `fields(...)`, `sections(...)`, `tabs(...)`, `wizard(...)`,
`actions(fn)`, `actionsPosition`, `build()`.

### 4.2 Feldtypen
Basis-Methoden (alle): `label`, `placeholder`, `helperText`, `required`, `disabled`,
`readOnly`, `hidden`, `default(v)`, `columnSpan(n)`, `className`, `rules`, `zodSchema`, `reactive`.
`required`/`disabled`/`readOnly`/`hidden` akzeptieren auch `(data)=>boolean` (Field Dependencies).

**Weitere allgemeine Parameter** (alle Felder):

| Gruppe | Methode | Wirkung |
|---|---|---|
| Reaktiv | `afterStateUpdated((value, set, data) => …)` | Seiteneffekt bei Änderung; `set(feld, wert)` setzt andere Felder. Aktiviert `reactive`. |
| Reaktiv | `live({ debounce })` · `debounce(ms)` | Re-Render bei Änderung; `afterStateUpdated` debounced. |
| Kontext | `visibleOn` · `hiddenOn` · `disabledOn` (`'create' \| 'edit'`) | Feld je nach Operation. Greift, wenn `<FormRenderer operation=…>` gesetzt ist (Dialoge automatisch). |
| Validierung | `validate((value, data) => string \| null)` | Eigener Validator mit Klartext-Fehler. |
| UX | `hint(text)` · `hintIcon(node)` · `hintColor(c)` | Hinweis **rechts neben dem Label** (vs. `helperText` darunter). |
| UX | `tooltip(text)` | Info-Icon mit Tooltip am Label. |
| UX | `autofocus()` · `prefixIcon(node)` · `suffixIcon(node)` | Fokus / Icon im Feld (TextInput). |
| Layout | `columnSpanFull()` | Feld über alle Spalten. |
| Submit | `dehydrated(false)` | Feld wird **nicht** an den Server gesendet (reines UI-Feld). |
| Submit | `formatStateUsing((v, data) => …)` | Wert beim Laden formatieren (Anzeige). |
| Submit | `mutateBeforeSave((v, data) => …)` | Wert kurz vor dem Submit umwandeln (z.B. `trim`). |

```tsx
TextInput.make<User>("name").autofocus().hint("Pflicht").mutateBeforeSave((v) => v.trim()),
Select.make<User>("status").afterStateUpdated((v, set) => { if (v === "archived") set("active", false); }),
DatePicker.make<User>("verified_at").hiddenOn("create"),   // erst beim Bearbeiten
FileUpload.make("scratch").dehydrated(false),              // nur UI, nicht gesendet
```

| Feld | Spezifisch |
|---|---|
| `TextInput` | `email`, `password`, `number`, `url`, `tel`, `type`, `minLength`, `maxLength`, `prefix`, `suffix` |
| `Textarea` | `rows`, `minLength`, `maxLength`, `autoResize` |
| `Select` | `options`, `multiple`, `searchable`, `clearable`, `maxItems`, `loadOptions` |
| `Checkbox` | (Basis) |
| `CheckboxGroup` | `options`, `columns` |
| `Toggle` | `onLabel`, `offLabel` |
| `RadioGroup` | `options`, `horizontal`, `vertical` |
| `DatePicker` | `minDate`, `maxDate`, `format`, `includeTime`, `locale` |
| `FileUpload` | `accept`, `maxSize`, `multiple`, `maxFiles`, `image`, `pdf` |
| `Repeater` | `fields`, `minItems`, `maxItems`, `addLabel`, `orderable` |
| `Hidden` | (Basis) |

### 4.3 Layouts (Cards / Tabs / Wizard)

Felder werden in `.fields(...)` **definiert** und per **Namen** in Sections/Tabs/Steps gruppiert.
`.sections()` / `.tabs()` / `.wizard()` sind **variadisch** (komma-separiert, **kein** Array — wie `.fields()`):

```tsx
FormSchema.make<User>()
  .fields( TextInput.make("name")…, TextInput.make("email")…, Toggle.make("active")… )
  .sections(
    SectionBuilder.make("Stammdaten").columns(2).fields(["name", "email"]),
    SectionBuilder.make("Einstellungen").collapsible().fields(["active"]),
  )
  .build();
```

- **Sections** (Cards): `SectionBuilder.make("Titel").description(…).columns(2).collapsible().fields([...])`
- **Tabs**: `.tabs(TabBuilder.make("Profil").icon(<User/>).fields([...]), …)`
- **Wizard** (mehrstufig): `.wizard(WizardStep.make("Konto").fields([...]), …)`
- Felder, die in **keiner** Section/Tab/Step stehen, werden **nicht** gerendert.

### 4.4 Rendern
```tsx
<FormRenderer schema={schema} data={data} errors={errors}
  onChange={(field, value)=>...} onSubmit={()=>...} processing={false} onBlur={...} />
```
Props: `schema`, `data`, `errors`, `onChange`, `onSubmit`, `processing`, `className`,
`disabled`, `onBlur`.

---

## 5. Inertia-Integration (`@nccirtu/tablefy/inertia`)

### 5.1 `useInertiaForm`
Verbindet ein `FormSchema` mit Inertias `useForm`:

```tsx
const form = useInertiaForm<CreateUser>({ schema, url: "/users", method: "post" });
<FormRenderer schema={schema} data={form.data} errors={form.errors}
  onChange={form.onChange} onSubmit={form.onSubmit} processing={form.processing} />
```
Optionen: `schema`, `initialData`, `url`, `method` (`post|put|patch|delete`),
`onSuccess/onError/onBefore/onFinish`, `preserveScroll`. Default-Werte werden aus dem
Schema abgeleitet; `initialData` überschreibt sie (z.B. für Edit).

### 5.2 `useServerTable`
State-Maschine für serverseitige Tabellen. `config`: `url`, `defaultSort`, `defaultPageSize`,
`debounce`, `preserveState`, `preserveScroll`, `only`. Rückgabe: `state` +
`setSearch`, `setSort`, `setPage`, `setPerPage`, `setFilter`, `resetFilters`. Jede Aktion
löst `router.visit(url, { data })` aus (Suche debounced).

### 5.3 `ServerDataTable` (empfohlen)
Deklarative Komponente, die `useServerTable` + `DataTable server={...}` selbst verkabelt:

```tsx
import { ServerDataTable, type PaginatedResponse } from "@nccirtu/tablefy/inertia";

export default function ListUsers({ users }: { users: PaginatedResponse<User> }) {
  return <ServerDataTable schema={usersTable} paginator={users} url="/users" />;
}
```
Props: `schema` (`TableSchema.build()`-Ergebnis), `paginator` (Laravel-Paginator), `url`,
optional `defaultSort`, `defaultPageSize`, `debounce`, `only`, `skeletonRows`. Default-Sort/Seitengröße
kommen aus dem Schema.

**Loading-Standard (Skeleton):** Die großen Components zeigen automatisch ein Skeleton:
- **Kein Paginator** (z.B. nicht geladene **deferred**-Prop) **oder `loading`** → **Skeleton-Reihen**.
- **Blättern/Suchen/Sortieren** → ebenfalls **Skeleton-Reihen** (während des Reloads).
- **Hintergrund-Refresh** (Daten vorhanden) → „stale" (alte Werte bleiben), kein Indikator.

Der **Basis-Controller defert die List-Query bereits per Default** (`Inertia::defer(...)`) → Page-Shell
sofort, Tabelle als Skeleton, dann poppen die Daten rein. Damit das **Blättern** die deferred-Prop
in **einem** Request auflöst (statt zweimal zu laden), gibt die generierte List-Page der Tabelle den
Prop-Namen mit:
```tsx
<ServerDataTable schema={usersTable} paginator={users} url="/users" only={['users']} />
```
`paginator` ist dadurch optional (`undefined`, solange deferred lädt) → Skeleton. `<ServerDataTable
skeletonRows={5} />` (Default 5). `Skeleton` ist auch als Primitive exportiert.

### 5.4 Backend-Vertrag (Query-Parameter)
Das Backend (z.B. ein generischer Controller) liest:

| Parameter | Bedeutung |
|---|---|
| `?search=…` | Volltextsuche über die suchbaren Spalten |
| `?filter[spalte]=wert` | Filter (Array → `whereIn`) |
| `?sort=spalte&direction=asc\|desc` | Sortierung (gegen Whitelist absichern!) |
| `?page=…&per_page=…` | Pagination |

Antwort: ein Laravel-Paginator → `{ data, current_page, last_page, per_page, total, from, to }`
(= `PaginatedResponse<T>`, exakt was `ServerDataTable`/`server.meta` erwartet).

### 5.5 Precognition
`createPrecognitionBlur(...)` ermöglicht Live-Server-Validierung beim Verlassen eines Feldes
(`onBlur` am `FormRenderer`).

---

## 6. Das Resource-Pattern (Laravel-Companion)

Das Composer-Paket **`nccirtu/tablefy-php`** (Quelle: `packages/tablefy-php/`) liefert einen
Generator, der eine komplette CRUD-Resource scaffoldet – du erstellst nur Model + Migration:

```bash
php artisan make:tablefy-resource Customer --generate
```

`--generate` liest die Tabelle und füllt Typ, Tabellen-Spalten, Formular-Felder und
Validierungsregeln vor. Erzeugt:

```
resources/js/types/tablefy/customer.ts                       @generated
resources/js/pages/tablefy/Customers/
├── CustomerResource.tsx                                      @generated (Meta + Routen)
├── Pages/{ListCustomers,CreateCustomer,EditCustomer}.tsx     @generated
├── Tables/CustomersTable.tsx                                 editierbar (bleibt bei Re-Run)
└── Schemas/CustomerForm.tsx                                  editierbar (bleibt bei Re-Run)
app/Http/Controllers/Tablefy/CustomerController.php           @generated
routes/tablefy.php                                            (Route angehängt)
```

Das Paket bietet außerdem die generische `TablefyController`-Basis (CRUD geerbt) und einen
Eloquent-`tablefy()`-Macro als Backend-Hälfte zu `useServerTable`/`ServerDataTable`:

```php
Customer::query()->tablefy($request)->paginate(15);
// wendet ?search / ?filter[col] / ?sort&direction an (per Model-Whitelist abgesichert)
```

### Navigation (Auto-Sidebar)

Resourcen erscheinen automatisch im Menü. Der Controller deklariert Nav-Attribute:

```php
protected ?string $navigationLabel = 'Benutzer';
protected ?string $navigationIcon  = 'users';   // lucide-Name
protected ?string $navigationGroup = 'Verwaltung';
protected int     $navigationSort  = 10;
public static function navigationBadge(): ?string { return (string) User::count(); }
```

Das Package scannt die registrierten Routen (alle `*.index` eines `TablefyController`) und
teilt die Navigation via Inertia als `props.tablefy.navigation`. Im Frontend speist du sie in
deine **eigene** Sidebar (das Package rendert sie nicht selbst — so bleibt der App-Look).

> ⚠️ `useTablefyNav()` ist ein **Hook** → **im Komponenten-Body** aufrufen, nicht als Modul-`const`
> (sonst „Invalid hook call"). Statische Items bleiben auf Modul-Ebene, kombiniert wird beim Rendern:

```tsx
// components/app-sidebar.tsx
import { useTablefyNav } from "@nccirtu/tablefy/inertia";
import type { NavItem } from "@/types";

const mainNavItems: NavItem[] = [{ title: "Dashboard", href: dashboard(), icon: LayoutGrid }];

export function AppSidebar() {
  const tablefyNav = useTablefyNav();            // Hook hier, im Body
  return <NavMain items={[...mainNavItems, ...tablefyNav]} />;
}
```

`useTablefyNav()` liefert die Items im `NavItem`-Format (Icon-Name → `LucideIcon` via kuratierter
Map; eigener Resolver via `useTablefyNav({ resolveIcon })`).

**Gruppierte Daten (optional):** `useTablefyNavGroups()` liefert dieselben Items nach
`$navigationGroup` gruppiert (`{ group, items }[]`) — reiner **Daten-Helper**, falls du
Gruppen-Überschriften mit deinen eigenen Sidebar-Bausteinen rendern willst. Das Package liefert
**keine** Sidebar-Komponente; das Rendering bleibt bei dir (wie beim flachen `useTablefyNav()`).

**Dev gegen das verlinkte Paket** (npm `link`/`file:`): durch den Symlink existieren zwei
`@types/react`/`react`-Kopien. Nötig sind dann (a) in `vite.config.ts`
`resolve.dedupe: ['react','react-dom','@inertiajs/react']` + `ssr.noExternal: [/^@nccirtu\/tablefy/]`
+ `server.fs.allow` aufs Monorepo, und (b) ggf. ein Cast `useTablefyNav() as NavItem[]`. Bei
normaler npm-Installation entfällt beides.

### Render Hooks (Slots)

Benannte Slots, in die du Inhalt einklinkst — **ohne** Package-Markup zu überschreiben
(Filament-„Render Hooks", in React). Das System kommt aus `@nccirtu/tablefy`, zuerst in der
Sidebar genutzt; es wächst auf Tabellen-Toolbar und Page-Header (Schicht B).

Zwei Bausteine:
- **`<RenderHook name="…" />`** — platzierst du an den Injection-Points (z.B. in deiner
  `app-sidebar.tsx`). Rendert alles, was für diesen Slot registriert ist.
- **`registerTablefyRenderHook(name, () => <…/>)`** — registriert Inhalt für einen Slot, einmal
  beim App-Start. Gibt eine **Unregister**-Funktion zurück.

```tsx
// app-sidebar.tsx — Injection-Point setzen:
import { RenderHook } from "@nccirtu/tablefy";
<SidebarContent>
  <NavMain items={[...mainNavItems, ...tablefyNav]} />
  <RenderHook name="sidebar.nav.end" />
</SidebarContent>

// resources/js/tablefy-hooks.tsx — Inhalt registrieren (mit DEINEN Komponenten):
import { registerTablefyRenderHook } from "@nccirtu/tablefy";
registerTablefyRenderHook("sidebar.nav.end", () => <YourNavSection />);

// resources/js/app.tsx
import "./tablefy-hooks";
```

`name` akzeptiert die bekannten Slots (Autocomplete) **oder** beliebige Strings. Der optionale
`scope`-Prop an `<RenderHook>` rendert pro-Instanz-Inhalt neben den global registrierten.

**Slots aktuell:** Sidebar `sidebar.header.end`, `sidebar.nav.start`, `sidebar.nav.end`,
`sidebar.footer.start`, `sidebar.footer.end`; Page `page.header.start`, `page.header.end`,
`page.actions.start`, `page.actions.end`, `page.footer`.
Code: `packages/tablefy/src/render-hooks.ts` (Registry) + `src/components/render-hook.tsx`.

### Page Schema (verschachtelte Layouts)

Eine Seite wird als **verschachteltes Schema** beschrieben (Filament-Modell): Kopf
(`title`/`description`/`breadcrumbs`/`headerActions`) + ein `.schema([…])`-Body aus
**Layout-Komponenten** (`Grid`, `Section`) und/oder **deinen** React-Komponenten. Du baust das
Schema **in der Page** (wo die Inertia-Props da sind) und fütterst deine Komponenten mit
Controller-Daten:

```tsx
import { PageSchema, Grid, Section } from "@nccirtu/tablefy";
import { TablefyPage } from "@nccirtu/tablefy/inertia";

export default function ListUsers({ users, stats }) {
  const page = PageSchema.make()
    .title("Benutzer")
    .headerActions((a) => a.button({ label: "Neu", href: UserResource.routes.create, icon: "plus" }))
    .schema([
      Grid.make(3).schema([
        <StatCard label="Gesamt" value={stats.total} />,
        <StatCard label="Aktiv" value={stats.active} />,
        <StatCard label="Neu" value={stats.new} />,
      ]),
      Section.make("Alle Benutzer").schema([
        <ServerDataTable schema={usersTable} paginator={users} url={UserResource.routes.index} />,
      ]),
    ])
    .build();

  return <TablefyPage schema={page} />;
}
```

- **`.schema([…])`** ist rekursiv: `Section`/`Grid` enthalten wieder `.schema([…])` (beliebig tief);
  rohe JSX-Knoten (deine Komponenten) werden direkt gerendert.
- `Grid.make(n)` → responsives Grid; `Section.make(titel).description().collapsible()` → Card.
- `<TablefyPage>` rendert Breadcrumbs + Header (mit gebundelten Buttons; Icon-Name oder JSX) + den
  rekursiven Body — lebt **in** deinem `AppLayout`. Header-Slots: `page.*` (s.o.).
- Ein konditionales Element im `.schema([…])` (z.B. `hasStats && <TablefyStats … />`) wird sauber
  **übersprungen**, wenn es `false`/`null` ist — kein Crash.

> **Der Generator erzeugt alle Seiten in genau diesem Stil:** `List`, `Create`, `Edit` **und** `View`
> bestehen aus `PageSchema.make()… .build()` + `<TablefyPage schema={page} />` (Header/Breadcrumbs/
> Actions deklarativ, Tabelle/Formular/Tabs im `.schema([…])`-Body). Der Controller (mit `rules()`,
> `$listStats`, …) ist **editierbar** und wird bei erneutem `make:tablefy-resource` **nicht**
> überschrieben (nur mit `--force`); die Pages sind `@generated` und werden aktualisiert.

**Builder:** `PageSchema`, `Grid`, `Section` aus `@nccirtu/tablefy`; `<TablefyPage>` aus
`@nccirtu/tablefy/inertia` (SPA-Links via Inertia). Code: `packages/tablefy/src/schema/` +
`src/inertia/tablefy-page.tsx`. Additiv geplant: `Tabs`/`Group`, read-only `Infolist`.

### Stats (Übersichts-Karten)

**Aufteilung wie bei Tabellen:** das Backend berechnet die **Zahlen**, das Frontend rendert die
**Karten** (mit Skeleton beim Laden). Stats haben einen **eigenen Command** und werden vom
Controller geladen — nicht automatisch.

```bash
# 1) Resource-bezogen (landet im Resource-Ordner, app + js):
php artisan make:tablefy-stat CustomerStats --resource=Customer
#   → app/Tablefy/Customers/Stats/CustomerStats.php
#   → mit --component zusätzlich: resources/js/pages/tablefy/Customers/Stats/CustomerStats.tsx

# 2) Allgemein (eigener Stats-Ordner):
php artisan make:tablefy-stat RevenueStats
#   → app/Tablefy/Stats/RevenueStats.php
```

**Backend** — eine `StatGroup` mit `Stat::make(name, value)` (mirror des TS-`StatData`):

```php
class CustomerStats extends StatGroup
{
    protected int $columns = 4;

    public function stats(Request $request): array
    {
        return [
            Stat::make('total', Customer::count())
                ->label('Kunden')->description('gesamt')->icon('users')->color('success'),
            Stat::make('new', Customer::whereMonth('created_at', now()->month)->count())
                ->label('Neu')->trend('up', '+12%'),
        ];
    }
}
```

**Controller** — registrieren; `index()` defert sie in **eigener** Gruppe (Tabelle wartet nie auf Stats):

```php
protected array $listStats = [\App\Tablefy\Customers\Stats\CustomerStats::class];
```

Der Basis-Controller liefert dann `hasStats: bool` (sofort) + `stats: StatGroupData[]` (deferred).

**Frontend** — die generierte List-Page rendert sie bereits; Schema/Anpassung optional:

```tsx
import { TablefyStats, Stats } from "@nccirtu/tablefy";

// Default: <TablefyStats data={stats} />  (Skeleton solange stats === undefined)
// Anpassen via Schema (nur Präsentation):
const CustomerStats = Stats.make()
  .columns(4)
  .renderStat("total", (s) => <MyCard stat={s} />);   // einzelne Karte überschreiben
// → <TablefyStats data={stats} schema={CustomerStats} />
```

`Stat`-Farben: `default | primary | success | danger | warning | info`. `trend(direction, label)` mit
`up | down | neutral`. `StatData`-Felder: `name, label, value, description?, icon?, color?, trend?`.
Code: PHP `packages/tablefy-php/src/Stats/` + Command `MakeTablefyStatCommand`; TS
`packages/tablefy/src/builders/stats.ts` + `src/tablefy/stats.tsx`.

### View-Page (`--view`) & Lazy-Relation-Tabs

```bash
php artisan make:tablefy-resource Customer --view
#   → registriert die show-Route (Route::tablefyResource(..., view: true))
#   → resources/js/pages/tablefy/Customers/Pages/ViewCustomer.tsx
```

Der Basis-Controller bekommt eine `show()`-Methode: der **Record** rendert sofort, **Detail-Stats**
(`$viewStats`) sind deferred, und **Relationen** (`$viewRelations`) sind `Inertia::optional` — sie laden
**nur beim Öffnen** des jeweiligen Tabs (Partial-Reload `only: ['posts']`), nie beim Initial-Render.

```php
// CustomerController:
protected array $viewStats = [\App\Tablefy\Customers\Stats\CustomerDetailStats::class];
protected array $viewRelations = ['posts', 'orders'];   // je eine Lazy-Tab-Seite
```

Detail-Stats erzeugst du mit `make:tablefy-stat CustomerDetailStats --resource=Customer --detail`
(Platzierung wie `--resource`, Registrierung aber in `$viewStats`).

**Frontend** — `<TablefyTabs>` (aus `/inertia`): normale Tabs rendern direkt; ein Tab mit `lazy:"users"`
lädt die Relation beim ersten Öffnen und zeigt bis dahin ein Skeleton. **Der Tab-Inhalt ist selbst
schema-fähig** — mit `<TablefySchema>` (aus `@nccirtu/tablefy`) verschachtelst du `Section`/`Grid`/JSX
wie in einer Page, nur ohne Page-Header:

Für die **Relationstabelle** legst du — wie bei Filament — ein **eigenes, vollwertiges `TableSchema`**
als separate Datei unter `…/Tables/` an (z.B. `CompanyUsersTable.tsx`) und renderst es mit
`<DataTable schema={…} data={…} />` (`DataTable` nimmt jetzt einen `schema`-Prop, symmetrisch zu
`ServerDataTable`):

```tsx
// Companies/Tables/CompanyUsersTable.tsx
import { TableSchema, TextColumn, DateColumn } from "@nccirtu/tablefy";
export type CompanyUser = { id: number; name: string; email: string; created_at: string | null };
export const companyUsersTable = TableSchema.make<CompanyUser>()
  .searchable({ placeholder: "Users suchen…" }).sortable()
  .columns(
    TextColumn.make<CompanyUser>("name").label("Name").sortable(),
    TextColumn.make<CompanyUser>("email").label("E-Mail").sortable(),
    DateColumn.make<CompanyUser>("created_at").label("Beigetreten").relative(),
  )
  .build();
```

```tsx
// Companies/Pages/ViewCompany.tsx
import { Grid, Section, TablefySchema, DataTable } from "@nccirtu/tablefy";
import { TablefyTabs } from "@nccirtu/tablefy/inertia";
import { companyUsersTable, type CompanyUser } from "../Tables/CompanyUsersTable";

<TablefyTabs
  tabs={[
    {
      value: "details", label: "Details",
      content: (
        <TablefySchema schema={[
          Section.make("Stammdaten").schema([
            Grid.make(2).schema([<Field label="Name" value={company.name} />]),
          ]),
        ]} />
      ),
    },
    {
      value: "users", label: "Users", lazy: "users",   // lädt erst beim Klick
      content: (users) => (
        <TablefySchema schema={[
          Section.make("Users").schema([
            <DataTable schema={companyUsersTable} data={users as CompanyUser[]} />,
          ]),
        ]} />
      ),
    },
  ]}
/>
```

`<TablefySchema schema={[…]}>` ist derselbe rekursive Renderer wie `<TablefyPage>` (Grid/Section/JSX,
überspringt `false`/`null`), nur ohne Header — nutzbar **überall** (Tabs, Cards, eigene Panels).
`<DataTable>` akzeptiert **entweder** `columns`/`config` **oder** ein gebautes `schema={…}` (Client-Modus,
inkl. Such-/Sortier-Funktion aus dem Schema). Code: `packages/tablefy/src/tablefy/schema-content.tsx` +
`src/inertia/tablefy-tabs.tsx`; Backend `show()` in `TablefyController`, Route-Makro `tablefyResource(..., view: true)`.

### Dialogs (Confirm + Form-Modals)

Eine **imperative** Dialog-Engine, von überall aufrufbar (Row-/Page-Actions, JSX, Handler). Genau
**eine** Ergänzung am Starter-Kit: `<TablefyDialogs />` einmal in `app.tsx → withApp` (neben `<Toaster/>`).

```tsx
import { dialog } from "@nccirtu/tablefy";

await dialog.confirm({ title: "Löschen?", variant: "destructive" });  // → Promise<boolean>
dialog.form({ title: "Neu", schema: companyForm, url: "/companies", method: "post" });
dialog.open({ title: "Custom", content: <MeinPanel/> });
```

**Drei Steuerebenen, eine Engine:**

1. **Resource-Default (`--modal`)** — `php artisan make:tablefy-resource Company --modal` erzeugt **keine**
   Create/Edit-Seiten (und keine `create`/`edit`-GET-Routen), setzt `formMode: "modal"` in der Resource
   und emittiert Dialog-Actions (Header „Neu" + Row „Bearbeiten" öffnen Modals). Ohne Flag → Seiten.
2. **Opt-in pro Action** — am Action-Objekt:
   ```ts
   ActionsColumn.make<Company>()
     .action({ label: "Bearbeiten", icon: "pencil",
       form: { schema: companyForm, method: "put",
               url: (r) => CompanyResource.routes.update(r.id), data: (r) => r } })
     .dialog({ label: "Vorschau", title: "Company", content: (r) => <Preview company={r}/> })
     .delete((r) => router.delete(CompanyResource.routes.destroy(r.id)))   // confirm automatisch
   // Header/Page: a.button({ label: "Neu", form: { schema, url, method: "post" } })
   ```
3. **Imperativ** — `dialog.confirm/form/open` direkt.

**Backend:** Form-Modals posten auf die bestehenden `store`/`update`-Routen (dieselbe `rules()`).
Validierungsfehler (422) erscheinen **inline im Modal**; bei Erfolg schließt es. Der Submit sendet
`X-Tablefy-Modal` → der Basis-Controller antwortet mit `back()` statt Index-Redirect → **du bleibst auf
der Seite** (deferred Props laden neu, Tabelle aktualisiert sich). Edit-Modals prefillen aus der Row
(kein Extra-Request).

`.delete()` bestätigt **standardmäßig** (Opt-out: `.delete(fn, { confirm: false })`). Dialog-Primitive:
`alert-dialog` (Confirm) + `dialog` (Forms, aus dem Starter-Kit gespiegelt). Engine in
`packages/tablefy/src/dialog/` (Store auf `globalThis` → über main- + /inertia-Bundle geteilt).

### Relationship- & Enum-Felder (auto-generiert, Filament-Stil)

`make:tablefy-resource … --generate` erkennt **Fremdschlüssel** (`*_id`) und **DB-Enums** und baut sie passend:

**Fremdschlüssel `company_id`:**
- **Form:** `Select.make("company_id").label("Company").optionsFrom("companyOptions").searchable()` — ein **suchbares Combobox** (shadcn `Command` + `Popover`).
- **Tabelle:** `TextColumn.make("company.name")` — zeigt das **Label** der Relation, nicht die ID (frei änderbar, z.B. `company.code`).
- **Controller:** `protected array $with = ['company'];` (eager-load) + `formOptions()` teilt `companyOptions` als Page-Prop. `rules()` bekommt `'company_id' => ['required','exists:companies,id']`.
- **Type:** `company?: { id: number; name: string } | null` wird ergänzt.

**Enum-Spalte:** Form → `Select.options([{value,label},…])`, Tabelle → `EnumColumn` (Badge) — Werte/Labels aus der DB-Enum-Definition geparst.

**Wie die Optionen ins Feld kommen:** `Select.optionsFrom("companyOptions")` liest die Optionen aus den Inertia-Page-Props über `<FormRenderer external={…} />`. Im **Modal** reicht der Dialog-Host `usePage().props` automatisch durch (keine Verkabelung); auf **Create/Edit-Seiten** gibt die Page ihre Props als `external` weiter. Label-Spalte wählbar (Default: `name`/`title`/`label`/`email` → erste String-Spalte). Code: `src/forms/fields/select.tsx` (Combobox), `src/forms/context.ts`, `ColumnMapper`.

---

Eine handgebaute Referenz derselben Struktur liegt zusätzlich unter `examples/customers/`.
Details: `packages/tablefy-php/README.md`.

---

## 7. CLI

```bash
npx tablefy init          # shadcn-Komponenten + Peers prüfen/installieren, Templates kopieren
npx tablefy add <name>    # einzelne Tablefy-Komponente ins Projekt kopieren
```

---

## 8. Build & Tests

- **Build:** `npm run build` = `build:lib` (Rollup, 4 Sub-Path-Bundles) +
  `build:fix-dts` (korrigiert die Sub-Path-`.d.ts`; **bei neuen `inertia`-Exports muss
  `scripts/fix-dts.js` ergänzt werden**) + `build:cli` (tsup).
- **Tests:** `npm test` (Jest + ts-jest, jsdom). Config in `jest.config.cjs` +
  `tsconfig.test.json`. shadcn-/Inertia-Imports werden über `moduleNameMapper` gemockt
  (`test/mocks/`). Abgedeckt: Builder, Filter, Spalten, FormSchema, `useServerTable`,
  `useInertiaForm`, `DataTable` (Server-Pagination), `DataTableFilters`, `ServerDataTable`.

---

## 9. Styling (Tailwind v4)

Das Package liefert **`@nccirtu/tablefy/styles.css`** mit Default-Design-Tokens (light/dark,
Tailwind v4 `@theme inline`). Die Komponenten nutzen **semantische Tokens** (`bg-primary`,
`text-muted-foreground`, `border-border`, `rounded-md`), die auf **CSS-Variablen** zeigen.
Anpassung erfolgt über diese Variablen im **eigenen Stylesheet** (nach der `styles.css`
geladen) – Komponenten-Code muss nie angefasst werden:

```css
@import "tailwindcss";
@import "@nccirtu/tablefy/styles.css";

:root { --primary: 25 95% 53%; --radius: 0.75rem; }   /* überschreibt Defaults */
.dark { --primary: 25 95% 53%; }
```

Punktuell: `className`-Props an `DataTable`/Spalten/Feldern.

> **Geplant:** ein `eject <component>`-Befehl, um eine einzelne UI-Komponente zur vollen
> Kontrolle ins Projekt zu kopieren (Escape Hatch).

---

## 10. Dependency-Modell & Bundling-Mechanik

**Alle UI-Primitives sind ins Package gebundelt** – es wird **nichts** mehr aus dem Projekt des
Users aufgelöst (`@/…`-Imports im `dist` = 0).

- Vendored Komponenten liegen unter `src/components/ui/*` bzw. `src/lib/utils.ts` (`cn`):
  button, table, badge, input, label, textarea, checkbox, switch, tooltip, card, progress,
  select, dropdown-menu, popover, tabs, radio-group, alert-dialog, calendar.
- Der Build (`rollup.config.js`) löst jeden `@/…`-Import via `@rollup/plugin-alias` auf `src/`
  auf und bündelt ihn (existenzbasierte Prüfung – bliebe eine Komponente unvendored, fiele sie
  automatisch auf „external" zurück, sodass der Build grün bleibt).
- Laufzeit-Abhängigkeiten der gebundelten Komponenten sind `dependencies` (npm installiert sie
  automatisch): `@radix-ui/react-*`, `class-variance-authority`, `clsx`, `tailwind-merge`,
  `lucide-react`, `react-day-picker`, `date-fns`.
- **Peers** (vom Host bereitgestellt): `react`, `react-dom`, `tailwindcss` (v4),
  `@tanstack/react-table`; optional `@inertiajs/react`, `zod`.

Ergebnis: `npm install @nccirtu/tablefy` genügt – kein shadcn, kein `@/`-Alias.

---

## 11. Rezepte, API-Möglichkeiten & Test-Checkliste

Konsolidierte Referenz aller Stellschrauben (Commands, Controller-Properties, Builder, Props) plus
End-to-End-Rezepte und eine Browser-Test-Checkliste.

### 11.1 API-Cheat-Sheet

**Commands**

| Command | Flag | Wirkung |
| --- | --- | --- |
| `make:tablefy-resource <Name>` | `--generate` | Liest die DB-Tabelle und füllt Type/Columns/Fields/Rules vor |
| | `--view` | Zusätzlich `show`-Route + `View<Name>`-Page (mit Lazy-Relation-Tabs) |
| | `--modal` | Create/Edit als Dialoge statt Seiten (keine Create/Edit-Pages + GET-Routen) |
| | `--force` | Überschreibt auch die editierbaren Tables/Schemas |
| `make:tablefy-stat <Name>` | `--resource=<Name>` | Resource-gebunden → `app/Tablefy/<Plural>/Stats/` |
| | `--detail` | Detail-Stats für die View-Page (→ `$viewStats`); impliziert `--resource` |
| | `--component` | Zusätzlich editierbares TS-Schema (`Stats.make()`) |
| | `--force` | Überschreibt vorhandene Dateien |
| `make:tablefy-relation <Res> <rel>` | `--model=<Name>` | Verwandtes Model (Default: Singular der Relation) |
| | `--generate` | Liest die Tabelle des Models → Columns + TS-Type vorbefüllt |
| | `--modal` | **Voller Relation-Manager** (Filament-Stil): eigenes Form + Create/Edit/Delete-Modals, CRUD über die Beziehung (FK serverseitig) |
| | `--register` | Trägt die Relation in `$viewRelations` (+ bei `--modal` `$relationManagers`) ein **und** fügt den Tab in die View-Page ein |
| | `--force` | Überschreibt vorhandene Dateien |

**Controller-Properties** (`extends TablefyController`)

| Property | Zweck |
| --- | --- |
| `$model, $folder, $singular, $plural, $routeName` | Identität der Resource |
| `$navigationLabel/Icon/Group/Sort`, `$shouldRegisterNavigation`, `navigationBadge()` | Sidebar-Eintrag |
| `$listStats` | Stat-Gruppen auf der **List**-Page |
| `$viewStats` | Stat-Gruppen auf der **View**-Page (Detail) |
| `$viewRelations` | Relationen als **Lazy-Tabs** auf der View-Page (`['posts', 'orders']`) |
| `rules(?Model)` | Validierung (Single Source of Truth) |

Geerbte Methoden: `index / create / store / edit / update / destroy` (+ `show`, sobald `view: true`).

**`Stat` (PHP)** — `Stat::make(string $name, string|int|float $value)` + Kette:
`->label()` · `->value()` · `->description()` · `->icon(lucide)` ·
`->color('default'|'primary'|'success'|'danger'|'warning'|'info')` · `->trend('up'|'down'|'neutral', ?$label)`.

**`StatGroup` (PHP)** — `abstract stats(Request): Stat[]`; `protected ?string $heading`, `protected int $columns = 4`.

**`Stats` (TS-Präsentation)** — `Stats.make()` · `.columns(n)` · `.renderCard((stat)=>node)` (alle) ·
`.renderStat(name,(stat)=>node)` (eine) · `.build()`.

**`<TablefyStats>`** — `data?` (`StatGroupData[] | StatGroupData | StatData[]`) · `schema?` (`Stats`|Config) ·
`columns?` · `skeletonCount?` (4) · `className?`. `data === undefined` → Skeleton-Karten.

**`<TablefyTabs>`** — `tabs: TablefyTab[]` · `defaultValue?` · `className?`.
`TablefyTab = { value, label, content, lazy?, skeleton? }`; bei `lazy:"prop"` ist `content` eine
Funktion `(data) => node` und der Tab lädt `prop` beim ersten Öffnen.

**`<TablefySchema>`** — `schema: unknown[]` · `className?`. Rekursiver Layout-Renderer (Grid/Section/JSX,
überspringt `false`/`null`) **ohne** Page-Header — für schema-getriebene Inhalte in Tabs, Cards, Panels.

**`<DataTable>`** — `columns`/`config` **oder** `schema={…}` (gebautes `TableSchema`) · `data?` · `server?`.
Client-Modus mit eigenem Schema → ideal für **Relationstabellen** (eigene Datei unter `…/Tables/`).

**Bulk-Actions** — `TableSchema.make().bulkActions([{ label, icon?, variant?, confirm?, onClick(rows), keepSelection? }])`
(aktiviert automatisch Row-Selection: Checkbox-Spalte). Erscheinen **in der Header-Toolbar** (Filament-Stil),
sobald Zeilen ausgewählt sind: **1 Action → Button, mehrere → „Aktionen"-Dropdown** (shadcn). `confirm: true`
fragt vorher. `icon` = lucide-Name. Generiert standardmäßig ein **Bulk-Delete** → `POST {slug}/bulk-destroy` →
Basis-Controller `bulkDestroy()` (Route vom Makro registriert). Der generierte Table-Stub hat **Platzhalter**
(auskommentiert) für eigene Bulk-Actions **und** `headerActions`.

**`dialog`** (imperativ, von überall) — `dialog.confirm(opts): Promise<boolean>` · `dialog.form({ schema, url, method, data?, onSuccess? })` · `dialog.open({ title?, content })` · `dialog.close(id?)`. Host: **`<TablefyDialogs/>`** einmal in `app.tsx → withApp`.

**Action-Configs** — `ActionsColumn`/`a.button` akzeptieren `confirm?: boolean|ConfirmOptions`, `form?: {…}`, `dialog?: {…}`. Shortcuts: `.delete()` (confirm by default), `.editForm(schema, url)`, `.dialog({ label, content })`.

**Row-Action zur View-Seite** — `ActionsColumn.make<T>().view((r)=>router.visit(Resource.routes.show(r.id)))`.
Der Generator fügt sie **automatisch** ein, wenn die Resource mit `--view` erzeugt wurde (sonst gäbe es
keine `show`-Route).

**Defer-Arten (Backend → Lade-Verhalten)**

| Backend | Lädt wann | Wofür |
| --- | --- | --- |
| `Inertia::defer(fn)` | automatisch nach Mount | Tabelle |
| `Inertia::defer(fn, 'stats')` | automatisch, **eigene** parallele Gruppe | Stats (blockiert die Tabelle nie) |
| `Inertia::optional(fn)` | **nur** bei Partial-Reload (`only`) | Relation-Tabs (Klick) |

### 11.2 Rezepte (End-to-End)

**A — Resource (nur Liste)**
```bash
php artisan make:tablefy-resource Customer --generate
```
Liste mit Server-Suche/Filter/Sort/Pagination + Skeleton. Keine Stats, keine View-Page.

**B — Liste + Stats**
```bash
php artisan make:tablefy-stat CustomerStats --resource=Customer
```
```php
// CustomerController
protected array $listStats = [\App\Tablefy\Customers\Stats\CustomerStats::class];
```
Die generierte List-Page rendert `{hasStats && <TablefyStats data={stats} />}` bereits.

**C — Allgemeine Stats (ohne Resource, z.B. Dashboard)**
```bash
php artisan make:tablefy-stat RevenueStats          # → app/Tablefy/Stats/RevenueStats.php
```
```php
// In einem beliebigen Controller:
return Inertia::render('Dashboard', [
    'stats' => Inertia::defer(fn () => [app(\App\Tablefy\Stats\RevenueStats::class)->resolve($request)]),
]);
```
```tsx
<TablefyStats data={stats} />
```

**D — View-Page (einfach)**
```bash
php artisan make:tablefy-resource Customer --view    # show-Route + ViewCustomer.tsx
```
Record rendert sofort; der „Details"-Tab wird mit `--generate` **automatisch aus dem DB-Schema** befüllt
(`<Field>`-Einträge je Spalte, in `Section`/`Grid`) — ohne `--generate` nur `ID` + TODO.

**E — View-Page + Detail-Stats**
```bash
php artisan make:tablefy-stat CustomerDetailStats --resource=Customer --detail
```
```php
protected array $viewStats = [\App\Tablefy\Customers\Stats\CustomerDetailStats::class];
```

**F — View-Page + Lazy-Relation-Tabs** (Filament-RelationManager-Äquivalent, **ein** Command)
```bash
php artisan make:tablefy-relation Company users --model=User --generate --register
#   → Companies/Tables/CompanyUsersTable.tsx  (volles TableSchema, Spalten aus der users-Tabelle)
#   → $viewRelations += 'users'  (Controller)
#   → fügt Import + Lazy-Tab in ViewCompany.tsx ein (am Marker @tablefy-relation-tabs)
```
Das war's — kein manueller Schritt. Der eingefügte Tab:
```tsx
{
  value: "users", label: "Users", lazy: "users",
  content: (users) => (
    <TablefySchema schema={[
      Section.make("Users").schema([
        <DataTable schema={companyUsersTable} data={users as CompanyUser[]} />,
      ]),
    ]} />
  ),
}
```
Backend resolved die Relation als `Inertia::optional(fn () => $record->users)` → lädt erst beim Klick.
**Idempotent:** erneutes Ausführen überspringt vorhandene Tabs. Fehlt der Marker (z.B. gelöscht) →
das Command **druckt** das Snippet zum manuellen Einfügen. Ohne `--register` wird nur die Tabellen-Datei
erzeugt (+ Snippet gedruckt).

**F2 — Relation-Manager (`--modal`, Filament-treu):** Relation-Tab mit eigenem Create/Edit/Delete.
```bash
php artisan make:tablefy-relation Company buildings --model=Building --generate --modal --register
```
Erzeugt: `app/Tablefy/Companies/Relations/CompanyBuildingsManager.php` (eigene `rules()`, **ohne** FK) +
`…/Relations/CompanyBuildingsRelation.tsx` (Section + „Neu" + Tabelle mit Edit/Delete-Modals), trägt
`$viewRelations` **und** `$relationManagers` ein und fügt den Tab ein. **CRUD läuft über die Beziehung:**
das Makro registriert `POST/PUT/DELETE {slug}/{id}/relations/{relation}` → Basis-Controller
`relationStore/Update/Destroy` machen `$parent->{relation}()->create/update/delete` → der **FK wird
serverseitig gesetzt** (taucht nicht im Form auf). Nach jeder Änderung lädt der Tab via `only` neu.
Voraussetzung: `Company` hat eine View-Page (`--view`) und die `buildings()`-Beziehung; das verwandte
Model **muss keine eigene Resource** sein (nur der TS-Type wird importiert).

**G — Stat-Karten anpassen (nur Präsentation)**
```tsx
const CustomerStats = Stats.make()
  .columns(3)
  .renderStat("revenue", (s) => <BigRevenueCard stat={s} />);   // eine Karte ersetzen
// → <TablefyStats data={stats} schema={CustomerStats} />
```

### 11.3 Test-Checkliste (Browser)

Nach Package-Änderungen erst `npm run build` in `packages/tablefy` (Host nutzt `dist`), bei PHP-Änderungen
ggf. `composer dump-autoload` in der Test-App. Dann mit **Network → Throttling „Slow 4G"**:

1. **Generieren:** `make:tablefy-resource Customer --generate --view`, dann beide Stat-Commands (B + E),
   `$listStats`/`$viewStats`/`$viewRelations` eintragen, `routes/web.php` enthält `require __DIR__.'/tablefy.php';`.
2. **List-Page (Erstaufruf):** App-Shell-Skeleton → Header sofort → Stat-Karten als Skeleton **und** Tabelle
   als Skeleton-Reihen → Daten poppen rein. Im Network-Tab: **zwei** deferred-Requests (Tabelle + `stats`) parallel.
3. **Blättern/Suchen/Sortieren:** Skeleton-Reihen während des Reloads, Pagination/Filter bleiben sichtbar.
4. **Navigation List → View:** kein Weiß; ViewCustomer-Record sofort, Detail-Stats als Skeleton → Zahlen.
5. **Lazy-Tab:** „Posts" klicken → Skeleton → Daten. Im Network-Tab erscheint **erst beim Klick** ein
   Request mit `only=posts`. Tab wechseln und zurück → **kein** erneuter Request.
6. **Leerer/0-Fall:** Resource ohne `$listStats` zeigt **keine** Stat-Sektion (kein Dauer-Skeleton).
