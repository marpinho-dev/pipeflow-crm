import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <>
      {/* Header skeleton */}
      <div className="flex h-14 items-center border-b border-border bg-background px-4 sm:px-6">
        <div className="space-y-1">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      <div className="space-y-6 p-4 sm:p-6">
        {/* Metric cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded-xl border border-border bg-card p-5">
            <Skeleton className="mb-4 h-4 w-32" />
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </div>
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <Skeleton className="mb-4 h-4 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
