// @generated – Server-Modus, deklarativ. Selten zu ändern.
//
// ServerDataTable verkabelt useServerTable + DataTable selbst: Suche, Sortierung und
// Pagination laufen serverseitig gegen CustomerController@index. Defaults (Sort, Seitengröße)
// kommen aus dem Schema – die Seite ist im Kern eine Zeile.

import { ServerDataTable, type PaginatedResponse } from "@nccirtu/tablefy-v2/inertia";
import { Head, Link } from "@inertiajs/react";
import { customersTable } from "../Tables/CustomersTable";
import { CustomerResource } from "../CustomerResource";
import type { Customer } from "@/types/tablefy/customer";

export default function ListCustomers({
  customers,
}: {
  customers: PaginatedResponse<Customer>;
}) {
  return (
    <>
      <Head title={CustomerResource.pluralLabel} />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{CustomerResource.pluralLabel}</h1>
        <Link
          href={CustomerResource.routes.create}
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Neuer Kunde
        </Link>
      </div>

      <ServerDataTable
        schema={customersTable}
        paginator={customers}
        url={CustomerResource.routes.index}
      />
    </>
  );
}
