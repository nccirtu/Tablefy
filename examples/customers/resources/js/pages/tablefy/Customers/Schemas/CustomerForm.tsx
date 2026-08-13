// @generated (vorbefüllt aus dem DB-Schema) – ab hier FREI editierbar.
//
// Layout/Felder des Formulars. Wird sowohl für "Create" als auch "Edit" verwendet.
// Validierungs-Wahrheit liegt im Backend (CustomerController::rules());
// hier definierst du nur Darstellung + clientseitige Hints (required/email …).

import { FormSchema, TextInput, Select } from "@nccirtu/tablefy-v2/forms";
import type { Customer } from "@/types/tablefy/customer";

export const customerForm = FormSchema.make<Customer>()
  .columns(2) // ← zweispaltiges Grid, frei änderbar
  .fields(
    TextInput.make<Customer>("name").label("Name").required(),
    TextInput.make<Customer>("email").label("E-Mail").email().required(),
    Select.make<Customer>("status")
      .label("Status")
      .options([
        { value: "active", label: "Aktiv" },
        { value: "inactive", label: "Inaktiv" },
      ])
      .required(),
    TextInput.make<Customer>("total_spent").label("Umsatz (€)").number(),
  )
  .actions((a) =>
    a.submit({ label: "Speichern" }).cancel({ label: "Abbrechen", href: "/customers" }),
  )
  .build();
