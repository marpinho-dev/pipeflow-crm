"use client"

import { useRef, useEffect } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { CalendarClock, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"


interface DealCardProps {
  deal: {
    id: string
    title: string
    value: number
    stage: string
    due_date: string | null
    lead?: { name: string } | null
    owner?: { name: string | null; email: string } | null
  }
  isOverlay?: boolean
  onEdit: () => void
  onDelete: () => void
}

function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export function DealCard({ deal, isOverlay, onEdit, onDelete }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id })

  // Prevent edit modal from opening right after a drag ends
  const dragOccurredRef = useRef(false)
  const prevDraggingRef = useRef(false)
  useEffect(() => {
    if (prevDraggingRef.current && !isDragging) {
      dragOccurredRef.current = true
      const t = setTimeout(() => { dragOccurredRef.current = false }, 200)
      return () => clearTimeout(t)
    }
    prevDraggingRef.current = isDragging
  }, [isDragging])

  function handleClick() {
    if (dragOccurredRef.current) return
    onEdit()
  }

  // When dragging, keep the original card in place as a ghost — DragOverlay handles movement
  const style: React.CSSProperties = isDragging
    ? { transition: "none" }
    : (transform ? { transform: CSS.Translate.toString(transform) } : {})

  const formattedValue = deal.value > 0
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(deal.value)
    : null

  const days = deal.due_date ? daysUntil(deal.due_date) : null
  const isOverdue = days !== null && days < 0
  const isUrgent  = days !== null && days <= 3 && days >= 0
  const dueDateLabel = deal.due_date
    ? isOverdue  ? `${Math.abs(days!)}d atraso`
    : days === 0 ? "Hoje"
    : `${days}d`
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      data-stage-card={deal.stage}
      className={cn(
        "group relative rounded-lg border border-border bg-card p-3 text-sm select-none",
        "cursor-grab active:cursor-grabbing",
        isDragging && !isOverlay && "opacity-30 scale-95",
        isOverlay && "shadow-lg ring-1 ring-border cursor-grabbing"
      )}
    >
      {/* Delete — stop pointer so drag doesn't start here */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="absolute right-2 top-2 hidden rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:flex"
        aria-label="Excluir negócio"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <p className="font-medium leading-snug pr-5 line-clamp-2">{deal.title}</p>

      {deal.lead && (
        <p className="mt-1 text-xs text-muted-foreground truncate">{deal.lead.name}</p>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        {formattedValue && (
          <span className="font-semibold text-foreground tabular-nums">{formattedValue}</span>
        )}
        {dueDateLabel && (
          <span className={cn(
            "flex items-center gap-1 text-xs font-medium ml-auto",
            isOverdue ? "text-red-500" : isUrgent ? "text-amber-500" : "text-muted-foreground"
          )}>
            <CalendarClock className="h-3 w-3" />
            {dueDateLabel}
          </span>
        )}
      </div>

      {deal.owner && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
            {(deal.owner.name ?? deal.owner.email)[0].toUpperCase()}
          </div>
          <span className="text-xs text-muted-foreground truncate">
            {deal.owner.name ?? deal.owner.email}
          </span>
        </div>
      )}
    </div>
  )
}
