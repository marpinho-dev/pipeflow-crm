import { Skeleton } from "@/components/ui/skeleton"

export default function ClientesLoading() {
  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
        <div className="space-y-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-9 w-full sm:max-w-sm rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-44 rounded-md" />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/50 px-4 py-3 flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="hidden sm:block h-4 w-20" />
            <Skeleton className="hidden md:block h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="hidden sm:block h-4 w-24" />
              <Skeleton className="hidden md:block h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-7 w-14 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
