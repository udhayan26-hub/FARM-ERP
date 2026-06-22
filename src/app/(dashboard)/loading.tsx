import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:w-64" />
          <Skeleton className="h-4 w-72 sm:w-96" />
        </div>
        <Skeleton className="hidden sm:block h-9 w-32" />
      </div>

      {/* Metric Cards Skeleton Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-muted bg-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Page Content List / Table Skeleton */}
      <Card className="border-muted bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-2">
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
          <div className="rounded-md border border-muted divide-y">
            {/* Table Header Skeleton */}
            <div className="bg-muted/30 px-4 py-3 flex justify-between gap-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} className="h-4 flex-1" />
              ))}
            </div>
            {/* Table Rows Skeleton */}
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <div key={rowIdx} className="px-4 py-4 flex justify-between gap-4">
                {Array.from({ length: 5 }).map((_, colIdx) => (
                  <Skeleton key={colIdx} className="h-4.5 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
