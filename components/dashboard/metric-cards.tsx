import { Users, Briefcase, DollarSign, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardsProps {
  totalLeads: number
  openDeals: number
  pipelineValue: number
  conversionRate: number
}

interface CardProps {
  label: string
  value: string
  icon: React.ElementType
  delay: number
  trend?: string
  trendUp?: boolean
}

function MetricCard({ label, value, icon: Icon, delay, trend, trendUp }: CardProps) {
  return (
    <div
      className={cn(
        "metric-card animate-fade-in-up",
        "relative rounded-xl border border-border bg-card p-5",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/30"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className={cn("mt-1 text-xs font-medium", trendUp ? "text-emerald-500" : "text-muted-foreground")}>
              {trend}
            </p>
          )}
        </div>
        <div className="ml-4 rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  )
}

export function MetricCards({ totalLeads, openDeals, pipelineValue, conversionRate }: MetricCardsProps) {
  const formattedValue = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pipelineValue)

  const cards: CardProps[] = [
    {
      label: "Total de Leads",
      value: totalLeads.toLocaleString("pt-BR"),
      icon: Users,
      delay: 0,
    },
    {
      label: "Negócios Abertos",
      value: openDeals.toLocaleString("pt-BR"),
      icon: Briefcase,
      delay: 100,
    },
    {
      label: "Valor do Pipeline",
      value: formattedValue,
      icon: DollarSign,
      delay: 200,
    },
    {
      label: "Taxa de Conversão",
      value: `${conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      delay: 300,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  )
}
