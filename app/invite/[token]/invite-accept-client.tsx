"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { acceptInviteAction } from "@/lib/actions/workspace"

interface InviteDetails {
  id: string
  email: string
  role: string
  workspace_id: string
  workspace_name: string
  workspace_plan: string
}

export function InviteAcceptClient({
  token,
  invite,
  isAuthenticated,
  userEmail,
}: {
  token: string
  invite: InviteDetails
  isAuthenticated: boolean
  userEmail: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const roleLabel = invite.role === "admin" ? "Administrador" : "Membro"
  const emailMatch = !isAuthenticated || userEmail === invite.email

  async function handleAccept() {
    setError("")
    setLoading(true)
    try {
      const result = await acceptInviteAction(token)
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold text-foreground">
        Convite para {invite.workspace_name}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Você foi convidado para entrar como <strong>{roleLabel}</strong> no workspace{" "}
        <strong>{invite.workspace_name}</strong>.
      </p>

      {isAuthenticated ? (
        <>
          {!emailMatch && (
            <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Este convite foi enviado para <strong>{invite.email}</strong>, mas você está logado
              como <strong>{userEmail}</strong>. Faça login com o e-mail correto para aceitar.
            </div>
          )}

          {error && (
            <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            onClick={handleAccept}
            disabled={loading || !emailMatch}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Aceitando..." : "Aceitar convite"}
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Faça login ou crie uma conta com o e-mail <strong>{invite.email}</strong> para aceitar
            o convite.
          </p>
          <Link
            href={`/login?redirectedFrom=/invite/${token}`}
            className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Entrar na conta
          </Link>
          <Link
            href={`/signup?redirectedFrom=/invite/${token}`}
            className="flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            Criar conta
          </Link>
        </div>
      )}
    </div>
  )
}
