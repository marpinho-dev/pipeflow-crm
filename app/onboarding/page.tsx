"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Users, UserPlus, Kanban, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { createWorkspaceAction, inviteMemberAction, joinWorkspaceByCodeAction } from "@/lib/actions/workspace"
import { createOnboardingLeadAction, createOnboardingDealAction } from "./actions"

const STEPS = [
  { label: "Workspace", icon: Building2 },
  { label: "Equipe",    icon: Users },
  { label: "Lead",      icon: UserPlus },
  { label: "Negócio",   icon: Kanban },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [mode, setMode]           = useState<"choose" | "create" | "join">("choose")
  const [step, setStep]           = useState(0)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")

  const [joinCode, setJoinCode]   = useState("")

  const [workspaceName, setWorkspaceName] = useState("")
  const [workspaceId, setWorkspaceId]     = useState("")

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole]   = useState<"admin" | "member">("member")

  const [leadName, setLeadName]       = useState("")
  const [leadCompany, setLeadCompany] = useState("")
  const [leadId, setLeadId]           = useState<string | null>(null)

  const [dealTitle, setDealTitle] = useState("")
  const [dealValue, setDealValue] = useState("")

  function clearError() { setError("") }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!joinCode.trim()) return
    clearError(); setLoading(true)
    try {
      const result = await joinWorkspaceByCodeAction(joinCode.trim())
      if (result.error) { setError(result.error); return }
      router.push("/dashboard")
      router.refresh()
    } finally { setLoading(false) }
  }

  function finish() {
    router.push("/dashboard")
    router.refresh()
  }

  async function handleStep0(e: React.FormEvent) {
    e.preventDefault()
    if (!workspaceName.trim()) return
    clearError(); setLoading(true)
    try {
      const result = await createWorkspaceAction(workspaceName.trim())
      if (result.error) { setError(result.error); return }
      setWorkspaceId(result.workspace.id)
      setStep(1)
    } finally { setLoading(false) }
  }

  async function handleStep1(skip = false) {
    if (skip || !inviteEmail.trim()) { setStep(2); return }
    clearError(); setLoading(true)
    try {
      const result = await inviteMemberAction(workspaceId, inviteEmail.trim(), inviteRole)
      if (result.error) { setError(result.error); return }
      setStep(2)
    } finally { setLoading(false) }
  }

  async function handleStep2(skip = false) {
    if (skip || !leadName.trim()) { setStep(3); return }
    clearError(); setLoading(true)
    try {
      const result = await createOnboardingLeadAction(leadName, leadCompany)
      if (result.error) { setError(result.error); return }
      if (result.leadId) setLeadId(result.leadId)
      setStep(3)
    } finally { setLoading(false) }
  }

  async function handleStep3(skip = false) {
    if (skip || !dealTitle.trim()) { finish(); return }
    clearError(); setLoading(true)
    try {
      const result = await createOnboardingDealAction(
        dealTitle,
        parseFloat(dealValue.replace(",", ".")) || 0,
        leadId
      )
      if (result.error) { setError(result.error); return }
      finish()
    } finally { setLoading(false) }
  }

  if (mode === "choose") {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-8 space-y-6">
          <div>
            <h1 className="text-xl font-semibold">Bem-vindo ao MARP CRM</h1>
            <p className="mt-1 text-sm text-muted-foreground">Como você quer começar?</p>
          </div>
          <div className="grid gap-3">
            <button
              onClick={() => setMode("create")}
              className="flex items-start gap-4 rounded-xl border border-border bg-background p-5 text-left hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Criar novo workspace</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Crie um espaço para sua empresa ou projeto e convide sua equipe.</p>
              </div>
            </button>
            <button
              onClick={() => setMode("join")}
              className="flex items-start gap-4 rounded-xl border border-border bg-background p-5 text-left hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <UserPlus className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Entrar em workspace existente</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Use o código fornecido pelo administrador do workspace.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === "join") {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold">Entrar em workspace</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Digite o código de 8 caracteres fornecido pelo administrador.
              </p>
            </div>
            <div>
              <input
                autoFocus
                required
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Ex: MARP1A2B"
                maxLength={8}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 font-mono text-lg tracking-widest text-center placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setMode("choose"); setError(""); setJoinCode("") }}
                className="flex-1 rounded-md border border-input px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading || joinCode.length < 6}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Entrando..." : "Entrar →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Progress bar */}
      <div className="flex border-b border-border">
        {STEPS.map((s, i) => {
          const done    = i < step
          const current = i === step
          return (
            <div
              key={s.label}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 py-3 text-xs font-medium transition-colors",
                done    && "bg-primary/10 text-primary",
                current && "bg-primary text-primary-foreground",
                !done && !current && "text-muted-foreground"
              )}
            >
              {done
                ? <Check className="h-3.5 w-3.5" />
                : <s.icon className="h-3.5 w-3.5" />
              }
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          )
        })}
      </div>

      <div className="p-8">
        {/* Step 0 — Workspace */}
        {step === 0 && (
          <form onSubmit={handleStep0} className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold">Crie seu workspace</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Um workspace é o espaço da sua empresa ou projeto.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nome do workspace</label>
              <input
                autoFocus
                required
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Ex: Acme Corp ou Minha Consultoria"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading || !workspaceName.trim()}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Criando..." : "Continuar →"}
            </button>
          </form>
        )}

        {/* Step 1 — Convidar equipe */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold">Convide sua equipe</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Adicione colaboradores ao workspace. Você pode fazer isso depois também.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">E-mail</label>
              <input
                autoFocus
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colega@empresa.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Papel</label>
              <div className="flex gap-2">
                {(["member", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setInviteRole(r)}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      inviteRole === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {r === "member" ? "Membro" : "Administrador"}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleStep1(true)}
                className="flex-1 rounded-md border border-input px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
              >
                Pular
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleStep1(false)}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Enviando..." : inviteEmail.trim() ? "Convidar e continuar →" : "Continuar →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Primeiro lead */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold">Adicione seu primeiro lead</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre um contato para começar seu pipeline.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nome do contato</label>
              <input
                autoFocus
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Empresa <span className="text-muted-foreground">(opcional)</span></label>
              <input
                value={leadCompany}
                onChange={(e) => setLeadCompany(e.target.value)}
                placeholder="Ex: Acme Corp"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleStep2(true)}
                className="flex-1 rounded-md border border-input px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
              >
                Pular
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleStep2(false)}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Salvando..." : leadName.trim() ? "Criar e continuar →" : "Continuar →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Primeiro negócio */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold">Crie seu primeiro negócio</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Adicione um negócio ao pipeline Kanban para acompanhar o progresso.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Título do negócio</label>
              <input
                autoFocus
                value={dealTitle}
                onChange={(e) => setDealTitle(e.target.value)}
                placeholder="Ex: Proposta Consultoria Q2"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Valor estimado <span className="text-muted-foreground">(opcional)</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <input
                  type="number"
                  min="0"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            {leadId && (
              <p className="text-xs text-muted-foreground">
                Será vinculado ao lead <strong>{leadName}</strong>.
              </p>
            )}
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleStep3(true)}
                className="flex-1 rounded-md border border-input px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
              >
                Pular
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleStep3(false)}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Salvando..." : dealTitle.trim() ? "Criar e entrar →" : "Entrar no dashboard →"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {step > 0 && (
        <div className="border-t border-border px-8 py-3 text-center">
          <p className="text-xs text-muted-foreground">
            Passo {step + 1} de {STEPS.length} — você pode configurar tudo isso depois em{" "}
            <button
              onClick={finish}
              className="underline hover:text-foreground"
            >
              Configurações
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
