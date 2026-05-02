"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { BarChart2 } from "lucide-react"

const STAGE_CONFIG = [
  { key: "new_lead",       label: "Novo Lead",         color: "#3B82F6" },
  { key: "contacted",      label: "Contato Realizado",  color: "#06B6D4" },
  { key: "proposal_sent",  label: "Proposta Enviada",   color: "#F59E0B" },
  { key: "negotiation",    label: "Negociação",          color: "#F97316" },
  { key: "closed_won",     label: "Fechado Ganho",      color: "#22C55E" },
  { key: "closed_lost",    label: "Fechado Perdido",    color: "#EF4444" },
]

interface StageStat {
  stage: string
  count: number
  value: number
}

interface FunnelChartProps {
  data: StageStat[]
}

interface TooltipPayload {
  value: number
  payload: { stage: string; value: number }
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null
  const config = STAGE_CONFIG.find((s) => s.label === label)
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-sm">
      <p className="font-medium" style={{ color: config?.color }}>{label}</p>
      <p className="text-muted-foreground mt-0.5">
        {payload[0].value} {payload[0].value === 1 ? "negócio" : "negócios"}
      </p>
    </div>
  )
}

export function FunnelChart({ data }: FunnelChartProps) {
  const chartData = STAGE_CONFIG.map((cfg) => {
    const found = data.find((d) => d.stage === cfg.key)
    return { name: cfg.label, count: found?.count ?? 0, color: cfg.color }
  })

  const isEmpty = chartData.every((d) => d.count === 0)

  if (isEmpty) {
    return (
      <div className="flex h-[280px] flex-col items-center justify-center text-center">
        <BarChart2 className="mb-2 h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">Nenhum negócio cadastrado</p>
        <p className="mt-0.5 text-xs text-muted-foreground/70">O funil aparecerá quando você criar negócios no pipeline.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 60 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          angle={-35}
          textAnchor="end"
          interval={0}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
