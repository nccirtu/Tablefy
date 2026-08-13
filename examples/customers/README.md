# Beispiel: Customer-Resource (handgebaut)

Dieser Ordner ist ein **Referenz-Blueprint**: die komplette „Customer"-Resource so, wie sie
am Ende aussieht – **von Hand** geschrieben, noch ohne Generator. Daraus leiten wir ab, was
`php artisan make:tablefy-resource Customer` später automatisch erzeugen soll.

> Hinweis: Das hier ist das *Tablefy-Package-Repo* (npm), kein Laravel-Projekt. Die Dateien
> laufen daher nicht direkt hier, sondern wenn man sie in eine Laravel+Inertia-App kopiert
> (Frontend nach `resources/js/...`, PHP nach `app/...`, `database/...`, `routes/...`).

## Struktur

```
resources/js/
├── types/tablefy/customer.ts              # @generated – Typ aus der Migration
└── pages/tablefy/Customers/
    ├── CustomerResource.tsx               # Grundgerüst: Meta + Routen
    ├── Pages/
    │   ├── ListCustomers.tsx              # ruft die Tabelle auf
    │   ├── CreateCustomer.tsx             # Formular → store
    │   └── EditCustomer.tsx               # Formular → update
    ├── Schemas/
    │   └── CustomerForm.tsx               # Form-Schema (frei editierbar)
    └── Tables/
        └── CustomersTable.tsx             # Table-Schema (frei editierbar)

app/
├── Models/Customer.php                    # der Entwickler
├── Tablefy/TablefyController.php          # generische CRUD-Basis (käme aus dem Paket)
└── Http/Controllers/Tablefy/CustomerController.php   # @generated, schlank
database/migrations/..._create_customers_table.php    # der Entwickler
routes/tablefy.php                         # @generated
```

## Wer schreibt was?

| Datei | Quelle |
|---|---|
| Migration, Model | **Du** (normales Laravel) |
| `customer.ts` (Typ) | **Generator** – liest die Migration/DB |
| `CustomerResource.tsx`, Pages, `CustomerController.php`, `routes/tablefy.php` | **Generator** – Grundgerüst |
| `CustomersTable.tsx`, `CustomerForm.tsx` | **Generator** befüllt vor, **du** passt frei an (Farben, Spalten, Layout) |
| `TablefyController.php` (Basis) | **Paket** (`nccirtu/tablefy-v2-php`) |

## Datenfluss (Backend → Frontend)

1. `GET /customers` → `CustomerController@index` (geerbt) → wendet Suche + Sortierung + Pagination serverseitig an und liefert `Inertia::render('.../ListCustomers', ['customers' => $paginator])`.
2. `ListCustomers` rendert nur `<ServerDataTable schema={customersTable} paginator={customers} url="/customers" />`. Die Komponente verkabelt `useServerTable` + `<DataTable server={...}>` selbst; jede Such-/Sort-/Seiten-Änderung macht ein `router.visit()` zurück an `index()`.
3. „Neuer Kunde" → `CreateCustomer` → `useInertiaForm` postet an `/customers` → `store()` validiert via `rules()` und legt an.
4. Edit-Action in der Tabelle → `/customers/{id}/edit` → `EditCustomer` (Formular vorbefüllt) → `update()`.
5. Delete-Action → `router.delete('/customers/{id}')` → `destroy()`.

## Was der Generator daraus automatisieren muss

1. **Typ-Generierung**: `customers`-Tabelle lesen → `customer.ts` schreiben (enum → Union-Type, `decimal`→`number` …).
2. **Scaffold**: die 7 Frontend-Dateien + Controller + Routen-Eintrag aus Templates rendern (Platzhalter: `Customer`, `Customers`, `customers`).
3. **Vorbefüllen**: Table- und Form-Spalten aus den DB-Spalten ableiten (Spaltentyp → Column/Field-Typ).
4. **Idempotenz**: `@generated`-Dateien überschreiben, von Hand editierte (`Tables/`, `Schemas/`) NICHT.

## Server-Modus (Suche, Sortierung, Pagination)

Für Resources ist **serverseitig der Standard**. Das ist eine Zeile:

```tsx
<ServerDataTable schema={customersTable} paginator={customers} url="/customers" />
```

`ServerDataTable` (aus `@nccirtu/tablefy-v2/inertia`) richtet `useServerTable` ein und füttert
`<DataTable server={...}>` mit der aktuellen Seite + Paginator-Meta. Default-Sort und Seitengröße
kommen aus dem Schema.

**Filter** definierst du im Schema (`.filters(SelectFilter.make("status")...)`). Im Server-Modus
landen sie als `?filter[status]=…` im Request; `TablefyController::index()` wendet sie gegen
`Customer::$tablefyFilterable` an (Array-Werte → `whereIn`). Die Filter-UI ist ein Popover im
Tabellen-Header mit Aktiv-Zähler und „Zurücksetzen".

Backend-Vertrag (von `TablefyController::index()` gelesen):
`?search=…`, `?filter[spalte]=…` (gegen `Customer::$tablefyFilterable`), `?sort=spalte&direction=asc|desc` (gegen `Customer::$tablefySortable`), `?page=…&per_page=…`.

**Clientseitig** ist nur noch die Ausnahme für kleine, schon geladene Listen (kein `server`-Prop,
einfach `<DataTable data={array} … />`) – z.B. eine eingebettete Relation oder eine Tabelle im Modal.

Offen für später: ein Composer-Paket-Macro `Builder::tablefy($request)`, das die drei Backend-Schritte
kapselt, damit `index()` zu einer Zeile wird. Aktuell steckt die Logik in der Basis-Klasse `TablefyController`.
