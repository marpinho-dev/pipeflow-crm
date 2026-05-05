"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { createLeadAction, updateLeadAction, getLeadInstallmentsAction } from "@/lib/actions/leads"
import type { LeadFormData, InstallmentInput } from "@/types"

interface Profile {
  id: string
  name: string | null
  email: string
}

interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  role: string | null
  owner_id: string
  project_value?: number | null
  installments_count?: number | null
}

const STAGE_OPTIONS = [
  { value: "novo_cliente",        label: "Novo Cliente" },
  { value: "apresentar_proposta", label: "Apresentar Proposta" },
  { value: "proposta_aceita",     label: "Proposta Aceita" },
  { value: "obra_andamento",      label: "Obra em Andamento" },
  { value: "obra_finalizada",     label: "Obra Finalizada" },
  { value: "cliente_perdido",     label: "Cliente Perdido" },
  { value: "cliente_stand_by",    label: "Cliente em Stand By" },
]

const INPUT_CLASS =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

export function LeadModal({
  lead,
  memberProfiles,
  currentUserId,
  isAdmin,
  onClose,
}: {
  lead: Lead | null
  memberProfiles: Profile[]
  currentUserId: string
  isAdmin: boolean
  onClose: () => void
}) {
  const isEdit = !!lead

  const [form, setForm] = useState<LeadFormData>({
    name: lead?.name ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    company: lead?.company ?? "",
    role: lead?.role ?? "",
    owner_id: lead?.owner_id ?? currentUserId,
    initial_stage: "novo_cliente",
    project_value: lead?.project_value ?? undefined,
    installments_count: lead?.installments_count ?? undefined,
  })
  const [rows, setRows] = useState<{ amount: string; due_date: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  useEffect(() => {
    if (!isEdit || !lead?.id) return
    getLeadInstallmentsAction(lead.id).then((res) => {
      if (res.data && res.data.length > 0) {
        setRows(res.data.map((i) => ({ amount: String(i.amount), due_date: i.due_date })))
      }
    })
  }, [isEdit, lead?.id])

  function set(field: keyof LeadFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleProjectValueChange(value: string) {
    const num = value === "" ? undefined : parseFloat(value)
    setForm((prev) => ({ ...prev, project_value: num }))
  }

  function handleCountChange(value: string) {
    const count = value === "" ? undefined : parseInt(value, 10)
    setForm((prev) => ({ ...prev, installments_count: count }))
    if (!count || count < 1) { setRows([]); return }
    const projectValue = form.project_value ?? 0
    const defaultAmount = projectValue > 0 ? (projectValue / count).toFixed(2) : "0.00"
    setRows((prev) =>
      Array.from({ length: count }, (_, i) => ({
        amount: prev[i]?.amount ?? defaultAmount,
        due_date: prev[i]?.due_date ?? "",
      }))
    )
  }

  function updateRow(index: number, field: "amount" | "due_date", value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const installments: InstallmentInput[] = rows.map((row, i) => ({
        installment_number: i + 1,
        amount: parseFloat(row.amount) || 0,
        due_date: row.due_date,
      }))

      const payload: LeadFormData = {
        ...form,
        installments: installments.length > 0 ? installments : undefined,
      }

      const result = isEdit
        ? await updateLeadAction(lead.id, payload)
        : await createLeadAction(payload)

      if (result.error) { setError(result.error); return }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const rowsTotal = rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? "Editar lead" : "Novo lead"}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* Dados do lead */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Nome <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Nome completo"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@empresa.com"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Telefone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="(11) 99999-9999"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Empresa</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="Nome da empresa"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Cargo</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder="Ex: Diretor de TI"
                className={INPUT_CLASS}
              />
            </div>

            {!isEdit && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Etapa</label>
                <select
                  value={form.initial_stage ?? "novo_cliente"}
                  onChange={(e) => set("initial_stage", e.target.value)}
                  className={INPUT_CLASS}
                >
                  {STAGE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}

            {isAdmin && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Responsável</label>
                <select
                  value={form.owner_id}
                  onChange={(e) => set("owner_id", e.target.value)}
                  className={INPUT_CLASS}
                >
                  {memberProfiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.name ?? p.email}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Pagamentos do Projeto */}
          <div className="border-t border-border pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Pagamentos do Projeto</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Valor do Projeto (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.project_value ?? ""}
                  onChange={(e) => handleProjectValueChange(e.target.value)}
                  placeholder="0,00"
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Nº de Parcelas</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  step="1"
                  value={form.installments_count ?? ""}
                  onChange={(e) => handleCountChange(e.target.value)}
                  placeholder="Ex: 3"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {rows.length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 px-1 text-xs font-medium text-muted-foreground">
                  <span className="col-span-1 text-center">#</span>
                  <span className="col-span-6">Data prevista</span>
                  <span className="col-span-5">Valor (R$)</span>
                </div>
                {rows.map((row, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 text-center text-sm text-muted-foreground">{i + 1}</span>
                    <div className="col-span-6">
                      <input
                        type="date"
                        value={row.due_date}
                        onChange={(e) => updateRow(i, "due_date", e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div className="col-span-5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.amount}
                        onChange={(e) => updateRow(i, "amount", e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-1 text-right">
                  Total das parcelas: <span className="font-medium text-foreground">{formatBRL(rowsTotal)}</span>
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
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
              {loading ? (isEdit ? "Salvando..." : "Criando...") : (isEdit ? "Salvar" : "Criar lead")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
