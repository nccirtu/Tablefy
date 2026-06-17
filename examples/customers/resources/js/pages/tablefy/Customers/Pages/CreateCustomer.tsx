// @generated – verdrahtet das Formular mit der Store-Route. Selten zu ändern.

import { FormRenderer } from "@nccirtu/tablefy/forms";
import { useInertiaForm } from "@nccirtu/tablefy/inertia";
import { Head } from "@inertiajs/react";
import { customerForm } from "../Schemas/CustomerForm";
import { CustomerResource } from "../CustomerResource";
import type { Customer } from "@/types/tablefy/customer";

export default function CreateCustomer() {
  // useInertiaForm leitet Default-Werte aus dem Schema ab und übernimmt Submit + Fehler.
  const form = useInertiaForm<Customer>({
    schema: customerForm,
    url: CustomerResource.routes.store,
    method: "post",
  });

  return (
    <>
      <Head title={`${CustomerResource.label} erstellen`} />
      <FormRenderer
        schema={customerForm}
        data={form.data}
        errors={form.errors}
        onChange={form.onChange}
        onSubmit={form.onSubmit}
        processing={form.processing}
      />
    </>
  );
}
