import { CalendarClock, CalendarCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const STAGE_COLORS: Record<string, string> = {
  novo_cliente:        "text-blue-500",
  apresentar_proposta: "text-cyan-500",
  proposta_aceita:     "text-amber-500",
  obra_andamento:      "text-orange-500",
  obra_finalizada:     "text-emerald-500",
  cliente_perdido:     "text-red-500",
  cliente_stand_by:    "text-slate-500",
}

const STAGE_LABELS: Record<string, string> = {
  novo_cliente:        "Novo cliente",
  apresentar_proposta: "Apresentar a proposta",
  proposta_aceita:     "Proposta aceita",
  obra_andamento:      "Obra em andamento",
  obra_finalizada:     "Obra finalizada",
  cliente_perdido:     "Cliente Perdido",
  cliente_stand_by:    "Cliente em stand by",
}

interface UpcomingDeal {
  id: string
  title: string
  value: number
  stage: string
  due_date: string
  lead?: { name: string } | null
}

interface UpcomingDealsProps {
  deals: UpcomingDeal[]
}

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export function UpcomingDeals({ deals }: UpcomingDealsProps) {
  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CalendarCheck className="mb-2 h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">Sem prazos próximos</p>
        <p className="mt-0.5 text-xs text-muted-foreground/70">Negócios com prazo nos próximos 14 dias aparecem aqui.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {deals.map((deal) => {
        const days = daysUntil(deal.due_date)
        const isOverdue = days < 0
        const isToday = days === 0
        const urgent = days <= 3

        const daysLabel = isOverdue
          ? `${Math.abs(days)}d atrasado`
          : isToday
          ? "Hoje"
          : `${days}d restantes`

        const formattedValue = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(deal.value)

        return (
          <li
            key={deal.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-accent/50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{deal.title}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                {deal.lead && <span className="truncate">{deal.lead.name}</span>}
                <span className={cn("font-medium", STAGE_COLORS[deal.stage])}>
                  {STAGE_LABELS[deal.stage]}
                </span>
              </div>
            </div>
            <div className="ml-4 flex shrink-0 flex-col items-end gap-0.5">
              <span className="font-semibold tabular-nums">{formattedValue}</span>
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  isOverdue ? "text-red-500" : urgent ? "text-amber-500" : "text-muted-foreground"
                )}
              >
                <CalendarClock className="h-3 w-3" />
                {daysLabel}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
