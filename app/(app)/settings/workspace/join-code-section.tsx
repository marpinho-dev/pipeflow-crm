"use client"

import { useState, useEffect } from "react"
import { Copy, RefreshCw, Check } from "lucide-react"
import { regenerateJoinCodeAction } from "@/lib/actions/workspace"

export function JoinCodeSection({
  workspaceId,
  initialCode,
  isAdmin,
}: {
  workspaceId: string
  initialCode: string
  isAdmin: boolean
}) {
  const [code, setCode] = useState(initialCode)

  useEffect(() => {
    setCode(initialCode)
  }, [initialCode, workspaceId])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegenerate() {
    setLoading(true)
    setError(null)
    const result = await regenerateJoinCodeAction(workspaceId)
    if (result.error) {
      setError(result.error)
    } else if (result.join_code) {
      setCode(result.join_code)
    }
    setLoading(false)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-1 text-base font-semibold text-foreground">Código de acesso</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Compartilhe este código com quem você quer convidar. O novo membro entra na plataforma e usa o código para entrar neste workspace.
      </p>

      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-md border border-input bg-muted px-4 py-2.5 font-mono text-lg font-bold tracking-widest text-foreground select-all">
          {code}
        </div>
        <button
          onClick={handleCopy}
          title="Copiar código"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent"
        >
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
        </button>
        {isAdmin && (
          <button
            onClick={handleRegenerate}
            disabled={loading}
            title="Gerar novo código"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      {isAdmin && (
        <p className="mt-2 text-xs text-muted-foreground">
          Ao gerar um novo código, o anterior deixa de funcionar imediatamente.
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
