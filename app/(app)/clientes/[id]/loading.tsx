import { Skeleton } from "@/components/ui/skeleton"

export default function ClienteDetailLoading() {
  return (
    <>
      <div className="flex h-14 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
        <Skeleton className="h-4 w-16" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="flex flex-col overflow-auto md:flex-row md:h-[calc(100vh-3.5rem-3.5rem)] md:overflow-hidden">
        <aside className="w-full shrink-0 border-b border-border bg-card p-5 space-y-4 md:w-80 md:border-b-0 md:border-r">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="h-4 w-4 shrink-0" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="relative pl-11 pb-6 last:pb-0">
                <Skeleton className="absolute left-0 top-0.5 h-8 w-8 rounded-full" />
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  )
}
