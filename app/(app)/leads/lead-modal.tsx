"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { createLeadAction, updateLeadAction, type LeadFormData } from "@/lib/actions/leads"

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
  status: string
  owner_id: string
}

const STATUS_OPTIONS = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "converted", label: "Convertido" },
  { value: "lost", label: "Perdido" },
]

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
    status: (lead?.status as LeadFormData["status"]) ?? "active",
    owner_id: lead?.owner_id ?? currentUserId,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  function set(field: keyof LeadFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = isEdit
        ? await updateLeadAction(lead.id, form)
        : await createLeadAction(form)

      if (result.error) {
        setError(result.error)
        return
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? "Editar lead" : "Novo lead"}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
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
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@empresa.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Telefone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Empresa</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="Nome da empresa"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Cargo</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder="Ex: Diretor de TI"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {isAdmin && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Responsável</label>
                <select
                  value={form.owner_id}
                  onChange={(e) => set("owner_id", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {memberProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name ?? p.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
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
