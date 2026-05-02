import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}
