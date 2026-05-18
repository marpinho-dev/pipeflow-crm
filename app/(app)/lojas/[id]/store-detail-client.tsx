"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Pencil, Mail, Phone, Percent, TrendingUp,
  Plus, Trash2, CheckCircle2, ShoppingBag, Clock,
} from "lucide-react"
import {
  createPurchaseAction,
  markFeeAsPaidAction,
  deletePurchaseAction,
} from "@/lib/actions/stores"
import { StoreModal } from "../store-modal"
import type { Store } from "@/types"
import type { StorePurchase, PurchaseFormData } from "@/lib/actions/stores"
import { cn } from "@/lib/utils"

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function PurchaseForm({
  storeId,
  referralPct,
  clientNames,
  onClose,
}: {
  storeId: string
  referralPct: number
  clientNames: string[]
  onClose: () => void
}) {
  const router = useRouter()
  const [form, setForm] = useState<PurchaseFormData>({
    client_name: "",
    amount: 0,
    purchase_date: new Date().toISOString().split("T")[0],
    fee_amount: 0,
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAmountChange(raw: string) {
    const amount = parseFloat(raw) || 0
    const fee_amount = parseFloat(((amount * referralPct) / 100).toFixed(2))
    setForm((p) => ({ ...p, amount, fee_amount }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await createPurchaseAction(storeId, form)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <h3 className="mb-4 text-base font-semibold text-foreground">Registrar compra</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Cliente *</label>
            <input
              required
              list="client-names-list"
              value={form.client_name}
              onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))}
              placeholder="Nome do cliente"
              autoComplete="off"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <datalist id="client-names-list">
              {clientNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Valor da compra *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.amount || ""}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0,00"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Fee ({referralPct}%)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.fee_amount || ""}
                onChange={(e) => setForm((p) => ({ ...p, fee_amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Data de pagamento *</label>
            <input
              required
              type="date"
              value={form.purchase_date}
              onChange={(e) => setForm((p) => ({ ...p, purchase_date: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Opcional..."
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function StoreDetailClient({
  store,
  purchases,
  clientNames,
}: {
  store: Store
  purchases: StorePurchase[]
  clientNames: string[]
}) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [purchaseFormOpen, setPurchaseFormOpen] = useState(false)
  const [paying, setPaying] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const feePending = purchases
    .filter((p) => p.fee_status === "pending")
    .reduce((sum, p) => sum + Number(p.fee_amount), 0)

  const feeReceived = purchases
    .filter((p) => p.fee_status === "paid")
    .reduce((sum, p) => sum + Number(p.fee_amount), 0)

  const totalVolume = purchases.reduce((sum, p) => sum + Number(p.amount), 0)

  async function handleMarkAsPaid(purchaseId: string) {
    setPaying(purchaseId)
    await markFeeAsPaidAction(purchaseId, store.id)
    setPaying(null)
    router.refresh()
  }

  async function handleDelete(purchaseId: string) {
    setDeleting(purchaseId)
    await deletePurchaseAction(purchaseId, store.id)
    setDeleting(null)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Link
          href="/lojas"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Lojas
        </Link>
      </div>

      {/* Store info card */}
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

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Vol. Registrado
            </p>
            <p className="mt-1 text-base font-bold text-foreground">{formatBRL(totalVolume)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Fee Pendente
            </p>
            <p className="mt-1 text-base font-bold text-amber-600 dark:text-amber-400">{formatBRL(feePending)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Fee Recebido
            </p>
            <p className="mt-1 text-base font-bold text-primary">{formatBRL(feeReceived)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" /> Compras
            </p>
            <p className="mt-1 text-base font-bold text-foreground">{purchases.length}</p>
          </div>
        </div>
      </div>

      {/* Purchases table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Compras registradas</h2>
          <button
            onClick={() => setPurchaseFormOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            Registrar compra
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Data Pgto.</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Valor</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fee</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ShoppingBag className="mb-3 h-8 w-8 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-foreground">Nenhuma compra registrada</p>
                      <p className="mt-1 text-xs text-muted-foreground">Clique em "Registrar compra" para adicionar.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{purchase.client_name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {new Date(purchase.purchase_date + "T00:00:00").toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-foreground">{formatBRL(Number(purchase.amount))}</td>
                    <td className="px-4 py-3 text-foreground">{formatBRL(Number(purchase.fee_amount))}</td>
                    <td className="px-4 py-3">
                      {purchase.fee_status === "paid" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          <CheckCircle2 className="h-3 w-3" /> Recebido
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {purchase.fee_status === "pending" && (
                          <button
                            onClick={() => handleMarkAsPaid(purchase.id)}
                            disabled={paying === purchase.id}
                            className={cn(
                              "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                              "bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50"
                            )}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {paying === purchase.id ? "..." : "Recebido"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(purchase.id)}
                          disabled={deleting === purchase.id}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          aria-label="Excluir compra"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {purchaseFormOpen && (
        <PurchaseForm
          storeId={store.id}
          referralPct={Number(store.referral_percentage)}
          clientNames={clientNames}
          onClose={() => setPurchaseFormOpen(false)}
        />
      )}

      {editOpen && (
        <StoreModal store={store} onClose={() => { setEditOpen(false); router.refresh() }} />
      )}
    </div>
  )
}
