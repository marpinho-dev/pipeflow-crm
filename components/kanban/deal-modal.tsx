"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { createDealAction, updateDealAction } from "@/app/(app)/pipeline/actions"
import type { DealFormData } from "@/app/(app)/pipeline/actions"

const STAGE_OPTIONS = [
  { value: "new_lead",      label: "Novo Lead" },
  { value: "contacted",     label: "Contato Realizado" },
  { value: "proposal_sent", label: "Proposta Enviada" },
  { value: "negotiation",   label: "Negociação" },
  { value: "closed_won",    label: "Fechado Ganho" },
  { value: "closed_lost",   label: "Fechado Perdido" },
]

interface DealLike {
  id: string
  title: string
  value: number
  stage: string
  lead_id: string | null
  due_date: string | null
  owner_id: string
}

interface Profile {
  id: string
  name: string | null
  email: string
}

interface Lead {
  id: string
  name: string
}

interface DealModalProps {
  deal: DealLike | null
  defaultStage?: string
  leads: Lead[]
  memberProfiles: Profile[]
  currentUserId: string
  isAdmin: boolean
  onClose: () => void
}

const INPUT_CLASS =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"

export function DealModal({
  deal,
  defaultStage = "new_lead",
  leads,
  memberProfiles,
  currentUserId,
  isAdmin,
  onClose,
}: DealModalProps) {
  const isEdit = !!deal

  const [form, setForm] = useState<DealFormData>({
    title:    deal?.title    ?? "",
    value:    deal?.value    ?? 0,
    stage:    deal?.stage    ?? defaultStage,
    lead_id:  deal?.lead_id  ?? "",
    due_date: deal?.due_date ?? "",
    owner_id: deal?.owner_id ?? currentUserId,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  function set<K extends keyof DealFormData>(field: K, value: DealFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = isEdit
        ? await updateDealAction(deal.id, form)
        : await createDealAction(form)
      if (result.error) { setError(result.error); return }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">
            {isEdit ? "Editar negócio" : "Novo negócio"}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Título <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex: Proposta de consultoria"
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Value */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Valor (R$)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.value || ""}
                onChange={(e) => set("value", parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className={INPUT_CLASS}
              />
            </div>

            {/* Due date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Prazo</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => set("due_date", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Etapa</label>
            <select
              value={form.stage}
              onChange={(e) => set("stage", e.target.value)}
              className={INPUT_CLASS}
            >
              {STAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Lead */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Lead vinculado</label>
            <select
              value={form.lead_id}
              onChange={(e) => set("lead_id", e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Nenhum</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Owner (admin only) */}
          {isAdmin && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">Responsável</label>
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

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading
                ? isEdit ? "Salvando..." : "Criando..."
                : isEdit ? "Salvar" : "Criar negócio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
