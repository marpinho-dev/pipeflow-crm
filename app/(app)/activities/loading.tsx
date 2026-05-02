import { Skeleton } from "@/components/ui/skeleton"

export default function ActivitiesLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 sm:px-6 py-4">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-10 sm:w-36 rounded-md" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 border-b border-border bg-muted/20 px-4 sm:px-6 py-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-background px-4 sm:px-6 py-3">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      {/* Activity list */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
            <Skeleton className="mt-0.5 h-8 w-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
