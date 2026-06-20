import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: any[];
  data: TData[];
  searchKey?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
}: DataTableProps<TData, TValue>) {
  // Mock Data Table implementation
  return (
    <div className="rounded-md border bg-card">
      <div className="p-4 text-sm text-muted-foreground border-b">
        Data Table implementation would use @tanstack/react-table here.
      </div>
      <div className="p-4">
        {data.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No data found</div>
        ) : (
          <div>Showing {data.length} records</div>
        )}
      </div>
    </div>
  )
}
