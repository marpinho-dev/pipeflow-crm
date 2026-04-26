"use client"

import { useState } from "react"
import { Trash2, Shield, UserIcon, Mail, X, Plus, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  inviteMemberAction,
  removeMemberAction,
  updateMemberRoleAction,
  revokeInviteAction,
} from "@/lib/actions/workspace"

interface Profile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
}

interface Member {
  id: string
  role: string
  created_at: string
  user_id: string
  profile?: Profile | null
}

interface PendingInvite {
  id: string
  email: string
  role: string
  created_at: string
  expires_at: string
}

export function MembersClient({
  members,
  pendingInvites: initialInvites,
  workspaceId,
  currentUserId,
  isAdmin,
}: {
  members: Member[]
  pendingInvites: PendingInvite[]
  workspaceId: string
  currentUserId: string
  isAdmin: boolean
}) {
  const [invites, setInvites] = useState(initialInvites)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteError("")
    setInviteSuccess("")
    setInviteLoading(true)
    try {
      const result = await inviteMemberAction(workspaceId, inviteEmail, inviteRole)
      if (result.error) {
        setInviteError(result.error)
        return
      }
      setInvites((prev) => [
        ...prev,
        {
          id: result.invite!.id,
          email: inviteEmail,
          role: inviteRole,
          created_at: new Date().toISOString(),
          expires_at: result.invite!.expires_at,
        },
      ])
      setInviteSuccess(
        result.inviteUrl
          ? `Convite criado. Link: ${result.inviteUrl}`
          : "Convite enviado com sucesso."
      )
      setInviteEmail("")
      setInviteRole("member")
    } finally {
      setInviteLoading(false)
    }
  }

  async function handleRevokeInvite(inviteId: string) {
    setActionLoading(inviteId)
    try {
      const result = await revokeInviteAction(inviteId)
      if (!result.error) {
        setInvites((prev) => prev.filter((i) => i.id !== inviteId))
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRemoveMember(memberId: string) {
    setActionLoading(memberId)
    try {
      await removeMemberAction(memberId)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUpdateRole(memberId: string, role: "admin" | "member") {
    setActionLoading(memberId)
    try {
      await updateMemberRoleAction(memberId, role)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Members list */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">
            Membros <span className="ml-1 text-sm font-normal text-muted-foreground">({members.length})</span>
          </h2>
          {isAdmin && (
            <button
              onClick={() => { setShowInviteModal(true); setInviteSuccess("") }}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Convidar
            </button>
          )}
        </div>

        <ul className="divide-y divide-border">
          {members.map((member) => {
            const displayName = member.profile?.name ?? member.profile?.email ?? "Usuário"
            const displayEmail = member.profile?.email ?? ""
            const isCurrentUser = member.user_id === currentUserId
            const isOnlyAdmin = member.role === "admin" && members.filter((m) => m.role === "admin").length === 1

            return (
              <li key={member.id} className="flex items-center gap-3 px-6 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground truncate">{displayName}</span>
                    {isCurrentUser && (
                      <span className="shrink-0 text-xs text-muted-foreground">(você)</span>
                    )}
                  </div>
                  {displayEmail && (
                    <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                  )}
                </div>

                {isAdmin ? (
                  <RoleSelect
                    role={member.role as "admin" | "member"}
                    disabled={actionLoading === member.id || isOnlyAdmin}
                    onChange={(role) => handleUpdateRole(member.id, role)}
                  />
                ) : (
                  <RoleBadge role={member.role} />
                )}

                {isAdmin && !isCurrentUser && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={actionLoading === member.id}
                    className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    aria-label="Remover membro"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Pending invites */}
      {(isAdmin || invites.length > 0) && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold text-foreground">
              Convites pendentes{" "}
              <span className="ml-1 text-sm font-normal text-muted-foreground">({invites.length})</span>
            </h2>
          </div>

          {invites.length === 0 ? (
            <p className="px-6 py-4 text-sm text-muted-foreground">Nenhum convite pendente.</p>
          ) : (
            <ul className="divide-y divide-border">
              {invites.map((invite) => (
                <li key={invite.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-foreground truncate">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Expira em {new Date(invite.expires_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <RoleBadge role={invite.role} />
                  {isAdmin && (
                    <button
                      onClick={() => handleRevokeInvite(invite.id)}
                      disabled={actionLoading === invite.id}
                      className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      aria-label="Revogar convite"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Invite modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Convidar membro</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="rounded p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label htmlFor="invite-email" className="mb-1.5 block text-sm font-medium text-foreground">
                  E-mail
                </label>
                <input
                  id="invite-email"
                  type="email"
                  required
                  autoFocus
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="pessoa@empresa.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Papel</label>
                <div className="flex gap-2">
                  {(["member", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInviteRole(r)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                        inviteRole === r
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {r === "admin" ? <Shield className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                      {r === "admin" ? "Administrador" : "Membro"}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {inviteRole === "admin"
                    ? "Administradores podem gerenciar membros, convites e configurações."
                    : "Membros podem visualizar e editar leads e deals do workspace."}
                </p>
              </div>

              {inviteError && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {inviteError}
                </p>
              )}

              {inviteSuccess && (
                <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary break-all">
                  {inviteSuccess}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {inviteLoading ? "Enviando..." : "Enviar convite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn(
      "shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
      role === "admin"
        ? "bg-primary/10 text-primary"
        : "bg-muted text-muted-foreground"
    )}>
      {role === "admin" ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
      {role === "admin" ? "Admin" : "Membro"}
    </span>
  )
}

function RoleSelect({
  role,
  disabled,
  onChange,
}: {
  role: "admin" | "member"
  disabled: boolean
  onChange: (role: "admin" | "member") => void
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={role}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as "admin" | "member")}
        className="appearance-none rounded-full border border-border bg-background pl-2 pr-6 py-0.5 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-60 cursor-pointer focus:outline-none"
      >
        <option value="member">Membro</option>
        <option value="admin">Admin</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
