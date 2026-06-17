// @generated (Grundgerüst) – danach frei editierbar.
//
// Das "Grundgerüst" der Resource: zentrale Meta-Daten + alle Routen an EINER Stelle.
// Tables, Schemas und Pages greifen hierauf zu – so gibt es eine einzige Quelle für URLs/Labels.
// Bewusst OHNE Import von Table/Form, um Zirkular-Importe zu vermeiden.

export const CustomerResource = {
  name: "Customer",
  label: "Kunde",
  pluralLabel: "Kunden",

  // Routen kommen aus `Route::resource('customers', ...)` im Backend.
  routes: {
    index: "/customers",
    create: "/customers/create",
    store: "/customers",
    edit: (id: number | string) => `/customers/${id}/edit`,
    update: (id: number | string) => `/customers/${id}`,
    destroy: (id: number | string) => `/customers/${id}`,
  },
} as const;
