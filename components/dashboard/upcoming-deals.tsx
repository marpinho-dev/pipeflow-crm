import { CalendarClock } from "lucide-react"
import { cn } from "@/lib/utils"

const STAGE_COLORS: Record<string, string> = {
  new_lead:       "text-blue-500",
  contacted:      "text-cyan-500",
  proposal_sent:  "text-amber-500",
  negotiation:    "text-orange-500",
  closed_won:     "text-emerald-500",
  closed_lost:    "text-red-500",
}

const STAGE_LABELS: Record<string, string> = {
  new_lead:       "Novo Lead",
  contacted:      "Contato Realizado",
  proposal_sent:  "Proposta Enviada",
  negotiation:    "Negociação",
  closed_won:     "Fechado Ganho",
  closed_lost:    "Fechado Perdido",
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
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Sem negócios com prazo próximo.
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
