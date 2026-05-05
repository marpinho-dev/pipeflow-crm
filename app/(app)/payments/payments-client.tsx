"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { ChevronLeft, ChevronRight, CheckCircle2, Lock } from "lucide-react"
import { markInstallmentAsPaid } from "@/lib/actions/payments"
import type { PaymentsPageData, InstallmentItem, MonthlyTotal } from "@/lib/actions/payments"

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatBRLShort(value: number) {
  if (value >= 1_000_000) return `R$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R$${(value / 1_000).toFixed(0)}k`
  return `R$${value.toFixed(0)}`
}

function monthLabel(year: number, month: number) {
  return `${MONTH_NAMES[month - 1].slice(0, 3)}/${String(year).slice(2)}`
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-primary">{formatBRL(payload[0]?.value ?? 0)}</p>
    </div>
  )
}

function ProjectionChart({ data }: { data: MonthlyTotal[] }) {
  const chartData = data.map((d) => ({ name: monthLabel(d.year, d.month), total: d.total }))

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 h-full">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Projeção de Recebimentos</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Parcelas pendentes — próximos 12 meses</p>
      </div>
      {chartData.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Nenhuma parcela pendente no período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatBRLShort} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent))" }} />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function MonthlyList({
  items,
  onMarkAsPaid,
}: {
  items: InstallmentItem[]
  onMarkAsPaid: (id: string) => Promise<void>
}) {
  const [paying, setPaying] = useState<string | null>(null)

  async function handlePay(id: string) {
    setPaying(id)
    try {
      await onMarkAsPaid(id)
    } finally {
      setPaying(null)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 h-full">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Parcelas do Mês</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Pendentes e atrasadas</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Nenhuma parcela para este mês
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${
                item.is_overdue ? "border-destructive/30 bg-destructive/5" : "border-border bg-background"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{item.lead_name}</p>
                <p className="text-xs text-muted-foreground">
                  Parcela {item.installment_number} ·{" "}
                  {new Date(item.due_date + "T00:00:00").toLocaleDateString("pt-BR")}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{formatBRL(item.amount)}</span>
                  {item.is_overdue && (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      Atrasado
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handlePay(item.id)}
                disabled={paying === item.id}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {paying === item.id ? "..." : "Pago"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HistoryChart({ paid, overdue }: { paid: MonthlyTotal[]; overdue: MonthlyTotal[] }) {
  const [view, setView] = useState<"paid" | "overdue">("paid")

  const data = (view === "paid" ? paid : overdue).map((d) => ({
    name: monthLabel(d.year, d.month),
    total: d.total,
  }))

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Histórico de Pagamentos</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Últimos 12 meses</p>
        </div>
        <div className="flex rounded-md border border-border overflow-hidden text-xs font-medium">
          <button
            onClick={() => setView("paid")}
            className={`px-3 py-1.5 transition-colors ${
              view === "paid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            Pagos
          </button>
          <button
            onClick={() => setView("overdue")}
            className={`px-3 py-1.5 transition-colors border-l border-border ${
              view === "overdue" ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            Atrasados
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatBRLShort} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={60} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent))" }} />
          <Bar
            dataKey="total"
            fill={view === "paid" ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function LockedCard({ total_value, client_count }: { total_value: number; client_count: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted flex-shrink-0">
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">Valor em Propostas Abertas</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Clientes ainda em negociação — aguardando aprovação da proposta
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xl font-bold text-foreground">{formatBRL(total_value)}</p>
        <p className="text-xs text-muted-foreground">{client_count} cliente{client_count !== 1 ? "s" : ""}</p>
      </div>
    </div>
  )
}

export function PaymentsClient({
  data,
  selectedMonth,
  selectedYear,
}: {
  data: PaymentsPageData
  selectedMonth: number
  selectedYear: number
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  function navigateMonth(delta: number) {
    let m = selectedMonth + delta
    let y = selectedYear
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    startTransition(() => {
      router.push(`/payments?month=${m}&year=${y}`)
    })
  }

  async function handleMarkAsPaid(installmentId: string) {
    await markInstallmentAsPaid(installmentId)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Month selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateMonth(-1)}
          className="rounded-md border border-border p-1.5 hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[140px] text-center text-base font-semibold text-foreground">
          {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
        </span>
        <button
          onClick={() => navigateMonth(1)}
          className="rounded-md border border-border p-1.5 hover:bg-accent transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Linha 1: Projeção + Lista do mês */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6" style={{ minHeight: 320 }}>
        <ProjectionChart data={data.projectionMonths} />
        <MonthlyList items={data.monthlyList} onMarkAsPaid={handleMarkAsPaid} />
      </div>

      {/* Linha 2: Histórico */}
      <HistoryChart paid={data.historyPaid} overdue={data.historyOverdue} />

      {/* Rodapé: Travados */}
      <LockedCard
        total_value={data.locked.total_value}
        client_count={data.locked.client_count}
      />
    </div>
  )
}
