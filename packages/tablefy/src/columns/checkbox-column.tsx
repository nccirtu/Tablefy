import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";

export class CheckboxColumn<TData> {
  static make<TData>(): CheckboxColumn<TData> {
    return new CheckboxColumn();
  }

  build(): ColumnDef<TData, unknown> {
    return {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Alle auswählen"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Zeile auswählen"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };
  }
}
