// @generated (vorbefüllt aus dem DB-Schema) – ab hier FREI editierbar.
//
// Hier liegt die ganze Freiheit: Spalten hinzufügen/entfernen, Farben, Reihenfolge,
// Pagination-Größe … alles anpassbar. Der `Customer`-Typ schützt nur die Feldnamen
// (Autocomplete + Fehler bei Tippfehlern), nicht das Aussehen.

import {
  TableSchema,
  TextColumn,
  BadgeColumn,
  NumberColumn,
  DateColumn,
  ActionsColumn,
  SelectFilter,
} from "@nccirtu/tablefy-v2";
import { router } from "@inertiajs/react";
import type { Customer } from "@/types/tablefy/customer";
import { CustomerResource } from "../CustomerResource";

export const customersTable = TableSchema.make<Customer>()
  .searchable({ placeholder: "Kunden suchen…" })
  .sortable({ id: "name", desc: false })
  .paginated({ pageSize: 15, pageSizeOptions: [15, 30, 50] })
  .filters(
    SelectFilter.make("status").label("Status").options([
      { value: "active", label: "Aktiv" },
      { value: "inactive", label: "Inaktiv" },
    ]),
  )
  .striped()
  .columns(
    TextColumn.make<Customer>("name").label("Name").sortable(),
    TextColumn.make<Customer>("email").label("E-Mail"),
    BadgeColumn.make<Customer>("status").label("Status").variants({
      active: "success",   // ← Farben frei wählbar
      inactive: "secondary",
    }),
    NumberColumn.make<Customer>("total_spent").label("Umsatz").money("EUR").sortable(),
    DateColumn.make<Customer>("created_at").label("Erstellt").relative(),

    // CRUD-Actions: Edit navigiert, Delete schickt DELETE an die generierte Route.
    ActionsColumn.make<Customer>()
      .edit((c) => router.visit(CustomerResource.routes.edit(c.id)))
      .delete((c) => router.delete(CustomerResource.routes.destroy(c.id))),
  )
  .build();
