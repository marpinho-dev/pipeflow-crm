"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"
import {
  ChevronLeft, ChevronRight, CheckCircle2, ArrowLeft, Pencil,
  Mail, Phone, Percent, TrendingUp, Users,
} from "lucide-react"
import { markInstallmentAsPaid } from "@/lib/actions/payments"
import { StoreModal } from "../store-modal"
import type { Store } from "@/types"
import type { StorePaymentsData } from "@/lib/actions/stores"

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

function ProjectionChart({ data }: { data: StorePaymentsData["projectionMonths"] }) {
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
  items: StorePaymentsData["monthlyList"]
  onMarkAsPaid: (id: string) => Promise<void>
}) {
  const [paying, setPaying] = useState<string | null>(null)

  async function handlePay(id: string) {
    setPaying(id)
    try { await onMarkAsPaid(id) } finally { setPaying(null) }
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
                <Link href={`/leads/${item.lead_id}`} className="text-sm font-medium text-foreground hover:underline truncate block">
                  {item.lead_name}
                </Link>
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

function HistoryChart({
  paid,
  overdue,
}: {
  paid: StorePaymentsData["historyPaid"]
  overdue: StorePaymentsData["historyOverdue"]
}) {
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

export function StoreDetailClient({
  store,
  paymentsData,
  selectedMonth,
  selectedYear,
}: {
  store: Store
  paymentsData: StorePaymentsData
  selectedMonth: number
  selectedYear: number
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)

  function navigateMonth(delta: number) {
    let m = selectedMonth + delta
    let y = selectedYear
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    startTransition(() => {
      router.push(`/lojas/${store.id}?month=${m}&year=${y}`)
    })
  }

  async function handleMarkAsPaid(installmentId: string) {
    await markInstallmentAsPaid(installmentId)
    router.refresh()
  }

  const feeValue = (Number(store.sales_volume) * Number(store.referral_percentage)) / 100

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Navegação */}
      <div className="flex items-center gap-3">
        <Link
          href="/lojas"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Lojas
        </Link>
      </div>

      {/* Cabeçalho da loja */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">{store.name}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {store.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  {store.email}
                </span>
              )}
              {store.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  {store.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 flex-shrink-0" />
                {Number(store.referral_percentage).toFixed(2)}% de indicação
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors flex-shrink-0"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
        </div>

        {/* Métricas */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Vol. de Vendas
            </p>
            <p className="mt-1 text-base font-bold text-foreground">{formatBRL(Number(store.sales_volume))}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Percent className="h-3 w-3" /> Fee Total
            </p>
            <p className="mt-1 text-base font-bold text-primary">{formatBRL(feeValue)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Recebido
            </p>
            <p className="mt-1 text-base font-bold text-foreground">{formatBRL(paymentsData.totalReceived)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> Leads Vinculados
            </p>
            <p className="mt-1 text-base font-bold text-foreground">{paymentsData.linkedLeadsCount}</p>
          </div>
        </div>
      </div>

      {/* Seletor de mês */}
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

      {/* Projeção + Lista do mês */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6" style={{ minHeight: 320 }}>
        <ProjectionChart data={paymentsData.projectionMonths} />
        <MonthlyList items={paymentsData.monthlyList} onMarkAsPaid={handleMarkAsPaid} />
      </div>

      {/* Histórico */}
      <HistoryChart paid={paymentsData.historyPaid} overdue={paymentsData.historyOverdue} />

      {editOpen && (
        <StoreModal store={store} onClose={() => { setEditOpen(false); router.refresh() }} />
      )}
    </div>
  )
}
