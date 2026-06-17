import { createContext } from "react";

/**
 * Carries the current Inertia page props into the form renderer so fields can
 * resolve runtime data — e.g. a relationship `Select.optionsFrom("companyOptions")`
 * reads its options from here. Provided by `<FormRenderer external={…} />`
 * (the dialog host passes `usePage().props`); empty by default.
 */
export const TablefyDataContext = createContext<Record<string, unknown>>({});
