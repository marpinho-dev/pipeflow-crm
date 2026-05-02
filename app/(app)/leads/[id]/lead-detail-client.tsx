"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Pencil, Phone, Mail, Building2, Briefcase, User,
  PhoneCall, Mail as MailIcon, CalendarCheck, StickyNote,
  Trash2, Plus, X, Check, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { updateLeadAction } from "@/lib/actions/leads"
import {
  createActivityAction,
  updateActivityAction,
  deleteActivityAction,
  type ActivityFormData,
} from "@/lib/actions/activities"
import { LeadModal } from "../lead-modal"
import type { LeadFormData } from "@/types"

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
  created_at: string
  updated_at: string
  owner: Profile | null
}

interface Deal {
  id: string
  title: string
  value: number
  stage: string
  due_date: string | null
  owner: Profile | null
}

interface Activity {
  id: string
  type: string
  description: string
  activity_date: string
  author_id: string
  author: Profile | null
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active:    { label: "Ativo",      className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  inactive:  { label: "Inativo",    className: "bg-muted text-muted-foreground" },
  converted: { label: "Convertido", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  lost:      { label: "Perdido",    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
}

const STAGE_LABELS: Record<string, string> = {
  new_lead:       "Novo Lead",
  contacted:      "Contato Realizado",
  proposal_sent:  "Proposta Enviada",
  negotiation:    "Negociação",
  closed_won:     "Fechado Ganho",
  closed_lost:    "Fechado Perdido",
}

const ACTIVITY_TYPES: { value: string; label: string; icon: React.ElementType; color: string }[] = [
  { value: "call",    label: "Ligação",  icon: PhoneCall,    color: "text-blue-500" },
  { value: "email",   label: "E-mail",   icon: MailIcon,     color: "text-purple-500" },
  { value: "meeting", label: "Reunião",  icon: CalendarCheck, color: "text-green-500" },
  { value: "note",    label: "Nota",     icon: StickyNote,   color: "text-yellow-500" },
]

function ActivityIcon({ type, className }: { type: string; className?: string }) {
  const t = ACTIVITY_TYPES.find((a) => a.value === type) ?? ACTIVITY_TYPES[3]
  const Icon = t.icon
  return <Icon className={cn("h-4 w-4", t.color, className)} />
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

// ---- Activity Form ----
function ActivityForm({
  leadId,
  initial,
  onDone,
  onCancel,
}: {
  leadId: string
  initial?: Activity
  onDone: () => void
  onCancel: () => void
}) {
  const router = useRouter()
  const [form, setForm] = useState<ActivityFormData>({
    type: (initial?.type as ActivityFormData["type"]) ?? "note",
    description: initial?.description ?? "",
    activity_date: initial?.activity_date
      ? new Date(initial.activity_date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description.trim()) return
    setError("")
    setLoading(true)
    try {
      const result = initial
        ? await updateActivityAction(initial.id, leadId, form)
        : await createActivityAction(leadId, form)
      if (result.error) { setError(result.error); return }
      router.refresh()
      onDone()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex gap-2 flex-wrap">
        {ACTIVITY_TYPES.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: t.value as ActivityFormData["type"] }))}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                form.type === t.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      <textarea
        required
        autoFocus
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        placeholder="Descreva a atividade..."
        rows={3}
        className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="datetime-local"
            value={form.activity_date}
            onChange={(e) => setForm((f) => ({ ...f, activity_date: e.target.value }))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-accent"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !form.description.trim()}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            {loading ? "Salvando..." : (initial ? "Salvar" : "Registrar")}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}

// ---- Main Component ----
export function LeadDetailClient({
  lead,
  deals,
  activities,
  memberProfiles,
  currentUserId,
  isAdmin,
}: {
  lead: Lead
  deals: Deal[]
  activities: Activity[]
  memberProfiles: Profile[]
  currentUserId: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [showNewActivity, setShowNewActivity] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [dealsExpanded, setDealsExpanded] = useState(true)

  const status = STATUS_LABELS[lead.status] ?? STATUS_LABELS.active

  async function handleDeleteActivity() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteActivityAction(deleteTarget.id, lead.id)
      router.refresh()
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      {/* Top bar */}
      <div className="flex h-14 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
        <Link
          href="/leads"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Leads
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground truncate">{lead.name}</span>
      </div>

      <div className="flex flex-col overflow-auto md:flex-row md:h-[calc(100vh-3.5rem-3.5rem)] md:overflow-hidden">
        {/* Left panel — profile + deals */}
        <aside className="w-full shrink-0 border-b border-border bg-card p-5 space-y-5 md:w-80 md:border-b-0 md:border-r md:overflow-y-auto">
          {/* Lead profile */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h1 className="text-base font-semibold text-foreground leading-tight truncate">{lead.name}</h1>
                {lead.role && (
                  <p className="mt-0.5 text-sm text-muted-foreground truncate">{lead.role}</p>
                )}
              </div>
              <button
                onClick={() => setEditModalOpen(true)}
                className="ml-2 shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Editar lead"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>

            <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", status.className)}>
              {status.label}
            </span>

            <div className="space-y-2.5 text-sm">
              {lead.email && (
                <div className="flex items-center gap-2.5 text-foreground">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <a href={`mailto:${lead.email}`} className="truncate hover:underline">{lead.email}</a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2.5 text-foreground">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <a href={`tel:${lead.phone}`} className="truncate hover:underline">{lead.phone}</a>
                </div>
              )}
              {lead.company && (
                <div className="flex items-center gap-2.5 text-foreground">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{lead.company}</span>
                </div>
              )}
              {lead.role && (
                <div className="flex items-center gap-2.5 text-foreground">
                  <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{lead.role}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                <span className="truncate">{lead.owner?.name ?? lead.owner?.email ?? "—"}</span>
              </div>
            </div>

            <div className="border-t border-border pt-3 text-xs text-muted-foreground space-y-1">
              <p>Criado em {formatDate(lead.created_at)}</p>
              <p>Atualizado em {formatDate(lead.updated_at)}</p>
            </div>
          </div>

          {/* Linked deals */}
          <div className="border-t border-border pt-4">
            <button
              onClick={() => setDealsExpanded((v) => !v)}
              className="flex w-full items-center justify-between text-sm font-semibold text-foreground"
            >
              Negócios ({deals.length})
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", dealsExpanded && "rotate-180")} />
            </button>

            {dealsExpanded && (
              <div className="mt-3 space-y-2">
                {deals.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum negócio vinculado.</p>
                ) : (
                  deals.map((deal) => (
                    <div key={deal.id} className="rounded-lg border border-border bg-background p-3 space-y-1">
                      <p className="text-sm font-medium text-foreground truncate">{deal.title}</p>
                      <p className="text-xs text-muted-foreground">{STAGE_LABELS[deal.stage] ?? deal.stage}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{formatCurrency(deal.value ?? 0)}</span>
                        {deal.due_date && (
                          <span className="text-muted-foreground">{formatDate(deal.due_date)}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Right panel — activity timeline */}
        <main className="flex-1 p-4 sm:p-6 space-y-4 md:overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Atividades</h2>
            {!showNewActivity && (
              <button
                onClick={() => setShowNewActivity(true)}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                Nova atividade
              </button>
            )}
          </div>

          {showNewActivity && (
            <ActivityForm
              leadId={lead.id}
              onDone={() => setShowNewActivity(false)}
              onCancel={() => setShowNewActivity(false)}
            />
          )}

          {activities.length === 0 && !showNewActivity ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <StickyNote className="mb-3 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">Nenhuma atividade ainda</p>
              <p className="mt-1 text-xs text-muted-foreground">Registre ligações, e-mails, reuniões ou notas.</p>
              <button
                onClick={() => setShowNewActivity(true)}
                className="mt-4 flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                Nova atividade
              </button>
            </div>
          ) : (
            <div className="relative space-y-0">
              {/* Timeline line */}
              {activities.length > 0 && (
                <div className="absolute left-4 top-5 bottom-5 w-px bg-border" />
              )}

              {activities.map((activity) => {
                const t = ACTIVITY_TYPES.find((a) => a.value === activity.type)
                return (
                  <div key={activity.id} className="relative pl-11 pb-6 last:pb-0">
                    {/* Icon bubble */}
                    <div className="absolute left-0 top-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card">
                      <ActivityIcon type={activity.type} />
                    </div>

                    {editingActivity?.id === activity.id ? (
                      <ActivityForm
                        leadId={lead.id}
                        initial={activity}
                        onDone={() => setEditingActivity(null)}
                        onCancel={() => setEditingActivity(null)}
                      />
                    ) : (
                      <div className="group rounded-xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-foreground">
                                {t?.label ?? activity.type}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(activity.activity_date)}
                              </span>
                              {activity.author && (
                                <span className="text-xs text-muted-foreground">
                                  por {activity.author.name ?? activity.author.email}
                                </span>
                              )}
                            </div>
                            <p className="mt-1.5 text-sm text-foreground whitespace-pre-wrap">{activity.description}</p>
                          </div>

                          {(activity.author_id === currentUserId || isAdmin) && (
                            <div className="flex shrink-0 items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingActivity(activity)}
                                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                aria-label="Editar atividade"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(activity)}
                                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                aria-label="Excluir atividade"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Edit lead modal */}
      {editModalOpen && (
        <LeadModal
          lead={lead}
          memberProfiles={memberProfiles}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onClose={() => { setEditModalOpen(false); router.refresh() }}
        />
      )}

      {/* Delete activity confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-2 text-base font-semibold text-foreground">Excluir atividade</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteActivity}
                disabled={deleteLoading}
                className="flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
              >
                {deleteLoading ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
