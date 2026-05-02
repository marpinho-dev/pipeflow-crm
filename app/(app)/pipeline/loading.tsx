import { Skeleton } from "@/components/ui/skeleton"

const STAGES = ["Novo Lead", "Contato Realizado", "Proposta Enviada", "Negociação", "Fechado Ganho", "Fechado Perdido"]

export default function PipelineLoading() {
  return (
    <>
      {/* Header */}
      <div className="flex h-14 items-center border-b border-border bg-background px-4 sm:px-6">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="ml-4 h-3 w-40" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 border-b border-border bg-background px-4 sm:px-6 py-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 p-6 min-w-max">
          {STAGES.map((stage) => (
            <div key={stage} className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-muted/30">
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2.5 w-2.5 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-5 rounded-full" />
                </div>
              </div>
              <div className="flex flex-col gap-2 px-2 pb-2">
                {Array.from({ length: Math.floor(Math.random() * 2) + 1 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
