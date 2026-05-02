"use client"

import { useState, useMemo, useTransition } from "react"
import Link from "next/link"
import {
  Phone, Mail, Calendar, StickyNote, CheckCircle2, Circle,
  Trash2, Plus, ChevronDown, AlertCircle, Clock, CalendarDays,
  List,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  createActivityAction,
  completeActivityAction,
  uncompleteActivityAction,
  deleteActivityAction,
} from "./actions"
import type { ActivityType } from "@/types"

type Period = "overdue" | "today" | "week" | "all"

interface Activity {
  id: string
  type: ActivityType
  description: string
  activity_date: string
  completed: boolean
  completed_at: string | null
  lead_id: string
  author_id: string
  lead?: { id: string; name: string } | null
}

interface Lead    { id: string; name: string }
interface Profile { id: string; name: string | null; email: string }

interface Props {
  activities:     Activity[]
  leads:          Lead[]
  memberProfiles: Profile[]
  currentUserId:  string
}

const TYPE_ICONS: Record<ActivityType, React.ElementType> = {
  call:    Phone,
  email:   Mail,
  meeting: Calendar,
  note:    StickyNote,
}

const TYPE_LABELS: Record<ActivityType, string> = {
  call:    "Ligação",
  email:   "E-mail",
  meeting: "Reunião",
  note:    "Nota",
}

const TYPE_COLORS: Record<ActivityType, string> = {
  call:    "text-blue-500 bg-blue-500/10",
  email:   "text-purple-500 bg-purple-500/10",
  meeting: "text-green-500 bg-green-500/10",
  note:    "text-amber-500 bg-amber-500/10",
}

function todayRange() {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end   = new Date(); end.setHours(23, 59, 59, 999)
  return { start, end }
}

function weekEnd() {
  const d = new Date(); d.setHours(23, 59, 59, 999)
  d.setDate(d.getDate() + (6 - d.getDay()))
  return d
}

function classifyActivity(a: Activity): Period[] {
  const date = new Date(a.activity_date)
  const { start, end } = todayRange()
  const periods: Period[] = ["all"]
  if (date < start && !a.completed) periods.push("overdue")
  if (date >= start && date <= end)  periods.push("today")
  if (date >= start && date <= weekEnd()) periods.push("week")
  return periods
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

function resolveAuthor(authorId: string, profiles: Profile[]) {
  return profiles.find(p => p.id === authorId) ?? null
}

export function ActivitiesClient({ activities, leads, memberProfiles, currentUserId }: Props) {
  const [period, setPeriod]         = useState<Period>("all")
  const [typeFilter, setTypeFilter] = useState<ActivityType | "">("")
  const [ownerFilter, setOwner]     = useState("")
  const [showDone, setShowDone]     = useState(false)
  const [modalOpen, setModal]       = useState(false)
  const [isPending, startTransition] = useTransition()

  // Optimistic activity list
  const [localActivities, setLocal] = useState<Activity[]>(activities)
  // Sync if server data changes (re-render)
  useMemo(() => setLocal(activities), [activities])

  const counts = useMemo(() => ({
    overdue: localActivities.filter(a => classifyActivity(a).includes("overdue") && !a.completed).length,
    today:   localActivities.filter(a => classifyActivity(a).includes("today")   && !a.completed).length,
    week:    localActivities.filter(a => classifyActivity(a).includes("week")    && !a.completed).length,
  }), [localActivities])

  const filtered = useMemo(() => {
    return localActivities.filter(a => {
      if (!showDone && a.completed) return false
      if (typeFilter && a.type !== typeFilter) return false
      if (ownerFilter && a.author_id !== ownerFilter) return false
      if (period !== "all" && !classifyActivity(a).includes(period)) return false
      return true
    })
  }, [localActivities, period, typeFilter, ownerFilter, showDone])

  function optimisticComplete(id: string, done: boolean) {
    setLocal(prev => prev.map(a => a.id === id
      ? { ...a, completed: done, completed_at: done ? new Date().toISOString() : null }
      : a
    ))
    startTransition(async () => {
      done ? await completeActivityAction(id) : await uncompleteActivityAction(id)
    })
  }

  function optimisticDelete(id: string) {
    setLocal(prev => prev.filter(a => a.id !== id))
    startTransition(async () => { await deleteActivityAction(id) })
  }

  const PERIOD_TABS: { key: Period; label: string; icon: React.ElementType; count?: number }[] = [
    { key: "overdue", label: "Atrasadas",   icon: AlertCircle,  count: counts.overdue },
    { key: "today",   label: "Hoje",        icon: Clock,        count: counts.today   },
    { key: "week",    label: "Esta semana", icon: CalendarDays, count: counts.week    },
    { key: "all",     label: "Todas",       icon: List                                },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 sm:px-6 py-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">Atividades</h1>
          <p className="text-sm text-muted-foreground">Gerencie ligações, e-mails, reuniões e notas</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-3 sm:px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova atividade</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 border-b border-border bg-muted/20 px-4 sm:px-6 py-4">
        {[
          { key: "overdue" as Period, label: "Atrasadas",   color: "text-red-500",   bg: "bg-red-500/10",   count: counts.overdue },
          { key: "today"  as Period, label: "Hoje",        color: "text-amber-500", bg: "bg-amber-500/10", count: counts.today   },
          { key: "week"   as Period, label: "Esta semana", color: "text-blue-500",  bg: "bg-blue-500/10",  count: counts.week    },
        ].map(c => (
          <button
            key={c.key}
            onClick={() => setPeriod(period === c.key ? "all" : c.key)}
            className={cn(
              "rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40",
              period === c.key && "border-primary ring-1 ring-primary/20"
            )}
          >
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className={cn("text-2xl font-bold mt-1", c.color)}>{c.count}</p>
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-b border-border bg-background px-4 sm:px-6 py-3 overflow-x-auto">
        {/* Period tabs */}
        <div className="flex shrink-0 rounded-md border border-input overflow-hidden">
          {PERIOD_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setPeriod(t.key)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                period === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <t.icon className="h-3 w-3" />
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                  period === t.key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                )}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as ActivityType | "")}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos os tipos</option>
          {(Object.entries(TYPE_LABELS) as [ActivityType, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {/* Owner filter */}
        {memberProfiles.length > 1 && (
          <select
            value={ownerFilter}
            onChange={e => setOwner(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todos os responsáveis</option>
            {memberProfiles.map(p => (
              <option key={p.id} value={p.id}>{p.name ?? p.email}</option>
            ))}
          </select>
        )}

        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showDone}
            onChange={e => setShowDone(e.target.checked)}
            className="rounded"
          />
          Mostrar concluídas
        </label>
      </div>

      {/* Activity list */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Nenhuma atividade encontrada</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Tente ajustar os filtros ou crie uma nova atividade</p>
          </div>
        ) : (
          filtered.map(activity => {
            const Icon = TYPE_ICONS[activity.type]
            const isOverdue = !activity.completed && new Date(activity.activity_date) < todayRange().start
            const author = resolveAuthor(activity.author_id, memberProfiles)

            return (
              <div
                key={activity.id}
                className={cn(
                  "group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors",
                  activity.completed && "opacity-50"
                )}
              >
                {/* Type icon */}
                <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", TYPE_COLORS[activity.type])}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium", activity.completed && "line-through text-muted-foreground")}>
                    {activity.description}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-medium">{TYPE_LABELS[activity.type]}</span>
                    {activity.lead && (
                      <Link href={`/leads/${activity.lead.id}`} className="hover:text-foreground hover:underline">
                        {activity.lead.name}
                      </Link>
                    )}
                    {author && (
                      <span>{author.name ?? author.email}</span>
                    )}
                    <span className={cn(isOverdue && "text-red-500 font-medium")}>
                      {formatDate(activity.activity_date)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => optimisticComplete(activity.id, !activity.completed)}
                    disabled={isPending}
                    title={activity.completed ? "Reabrir" : "Concluir"}
                    className={cn(
                      "rounded p-1 transition-colors",
                      activity.completed
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-green-500 hover:bg-green-500/10"
                    )}
                  >
                    {activity.completed
                      ? <Circle className="h-4 w-4" />
                      : <CheckCircle2 className="h-4 w-4" />
                    }
                  </button>
                  <button
                    onClick={() => optimisticDelete(activity.id)}
                    disabled={isPending}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* New activity modal */}
      {modalOpen && (
        <NewActivityModal
          leads={leads}
          currentUserId={currentUserId}
          onClose={() => setModal(false)}
          onCreated={(a) => {
            setLocal(prev => [a, ...prev])
            setModal(false)
          }}
        />
      )}
    </div>
  )
}

function NewActivityModal({
  leads,
  currentUserId,
  onClose,
  onCreated,
}: {
  leads:         Lead[]
  currentUserId: string
  onClose:       () => void
  onCreated:     (a: Activity) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [leadId, setLeadId]   = useState(leads[0]?.id ?? "")
  const [type, setType]       = useState<ActivityType>("call")
  const [description, setDesc]= useState("")
  const [search, setSearch]   = useState("")
  const [showLeads, setShowLeads] = useState(false)

  const now = new Date()
  now.setMinutes(0, 0, 0)
  const defaultDate = now.toISOString().slice(0, 16)
  const [activityDate, setDate] = useState(defaultDate)

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase())
  )
  const selectedLead = leads.find(l => l.id === leadId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!leadId || !description.trim()) return
    setError(""); setLoading(true)
    try {
      const result = await createActivityAction({ leadId, type, description, activityDate })
      if (result.error) { setError(result.error); return }
      onCreated({
        id: crypto.randomUUID(),
        type, description, activity_date: activityDate,
        completed: false, completed_at: null,
        lead_id: leadId, author_id: currentUserId,
        lead: selectedLead ?? null,
      } as Activity)
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Nova atividade</h2>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* Lead searchable dropdown */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Lead</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLeads(!showLeads)}
                className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <span className={selectedLead ? "text-foreground" : "text-muted-foreground"}>
                  {selectedLead?.name ?? "Selecionar lead..."}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {showLeads && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
                  <div className="border-b border-border p-2">
                    <input
                      autoFocus
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Buscar lead..."
                      className="w-full rounded bg-background px-2 py-1 text-sm outline-none"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {filteredLeads.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum lead encontrado</p>
                    ) : filteredLeads.map(l => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => { setLeadId(l.id); setShowLeads(false); setSearch("") }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm hover:bg-accent",
                          l.id === leadId && "bg-primary/10 text-primary"
                        )}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Tipo</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(TYPE_LABELS) as [ActivityType, string][]).map(([k, v]) => {
                const Icon = TYPE_ICONS[k]
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setType(k)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                      type === k
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {v}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Descrição</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="Descreva a atividade..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Data e hora</label>
            <input
              type="datetime-local"
              value={activityDate}
              onChange={e => setDate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-input px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !leadId || !description.trim()}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Criar atividade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
