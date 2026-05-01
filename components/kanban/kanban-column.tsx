"use client"

import { useDroppable } from "@dnd-kit/core"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { DealCard } from "./deal-card"

interface Stage {
  key: string
  label: string
  color: string
}

interface DealLike {
  id: string
  title: string
  value: number
  stage: string
  due_date: string | null
  lead_id: string | null
  owner_id: string
  lead?: { id: string; name: string } | null
  owner?: { name: string | null; email: string } | null
}

interface KanbanColumnProps {
  stage: Stage
  deals: DealLike[]
  onAddDeal: (stage: string) => void
  onEditDeal: (deal: DealLike) => void
  onDeleteDeal: (dealId: string) => void
}

export function KanbanColumn({ stage, deals, onAddDeal, onEditDeal, onDeleteDeal }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key })

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)
  const formattedTotal = totalValue > 0
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(totalValue)
    : null

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-muted/30">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: stage.color }} />
          <span className="text-sm font-semibold">{stage.label}</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
            {deals.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {formattedTotal && (
            <span className="text-xs font-medium text-muted-foreground">{formattedTotal}</span>
          )}
          <button
            onClick={() => onAddDeal(stage.key)}
            className="ml-1 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label={`Novo negócio em ${stage.label}`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2 min-h-[120px] rounded-b-xl px-2 pb-2 transition-colors duration-200",
          isOver && "bg-primary/5 ring-1 ring-inset ring-primary/20"
        )}
      >
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onEdit={() => onEditDeal(deal)}
            onDelete={() => onDeleteDeal(deal.id)}
          />
        ))}

        {deals.length === 0 && !isOver && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/60 py-6">
            <p className="text-xs text-muted-foreground">Arraste um negócio aqui</p>
          </div>
        )}
      </div>
    </div>
  )
}
