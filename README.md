# Tablefy

Monorepo für **Tablefy** — ein schema-getriebenes Toolkit für Data Tables & Formulare
(React + Laravel/Inertia). Zwei Pakete, eine Vision:

| Paket | Ort | Sprache | Installation | Inhalt |
|---|---|---|---|---|
| **`@nccirtu/tablefy-v2`** | [`packages/tablefy`](./packages/tablefy) | TypeScript/React | `npm install @nccirtu/tablefy-v2` | DataTable, ~17 Spalten, Forms, Inertia-Integration (Frontend) |
| **`nccirtu/tablefy-v2-php`** | [`packages/tablefy-php`](./packages/tablefy-php) | PHP/Laravel | `composer require nccirtu/tablefy-v2-php` | `make:tablefy-resource`-Generator, CRUD-Controller, `tablefy()`-Query-Macro (Backend) |

Die beiden teilen keinen Code — sie sind die Frontend- und die Backend-Hälfte desselben
Workflows: Schema beschreiben → Tabelle/Formular kommt aus dem Paket; Resource generieren →
CRUD läuft ohne Boilerplate.

## Struktur

```
Tablefy/
├── packages/
│   ├── tablefy/        # npm-Paket (React) — Build/Tests hier
│   └── tablefy-php/    # Composer-Paket (Laravel) — Generator + Controller + Macro
├── docs/GUIDE.md       # vollständige How-it-works-Doku (Single Source of Truth)
└── examples/customers/ # handgebaute Referenz-Resource (Backend → Frontend)
```

## Entwicklung

```bash
# Frontend-Paket bauen / testen
npm run build        # = npm run build -w @nccirtu/tablefy-v2
npm test             # = npm run test  -w @nccirtu/tablefy-v2
# oder direkt:
cd packages/tablefy && npm run build && npx jest
```

## Doku

- **[Package Guide](./docs/GUIDE.md)** — wie alles funktioniert (Frontend + Backend)
- [`packages/tablefy-php/README.md`](./packages/tablefy-php/README.md) — Generator & Backend

## Lizenz

MIT
