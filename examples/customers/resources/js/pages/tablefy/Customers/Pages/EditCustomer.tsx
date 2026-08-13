// @generated – verdrahtet das Formular mit der Update-Route. Selten zu ändern.

import { FormRenderer } from "@nccirtu/tablefy-v2/forms";
import { useInertiaForm } from "@nccirtu/tablefy-v2/inertia";
import { Head } from "@inertiajs/react";
import { customerForm } from "../Schemas/CustomerForm";
import { CustomerResource } from "../CustomerResource";
import type { Customer } from "@/types/tablefy/customer";

export default function EditCustomer({ customer }: { customer: Customer }) {
  const form = useInertiaForm<Customer>({
    schema: customerForm,
    initialData: customer, // ← befüllt das Formular mit dem bestehenden Datensatz
    url: CustomerResource.routes.update(customer.id),
    method: "put",
  });

  return (
    <>
      <Head title={`${CustomerResource.label} bearbeiten`} />
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
