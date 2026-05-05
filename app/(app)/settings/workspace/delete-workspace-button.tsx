"use client"

import { useState } from "react"
import { deleteWorkspaceAction } from "@/lib/actions/workspace"

export function DeleteWorkspaceButton({
  workspaceId,
  workspaceName,
}: {
  workspaceId: string
  workspaceName: string
}) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (confirm !== workspaceName) return
    setLoading(true)
    setError(null)
    const result = await deleteWorkspaceAction(workspaceId)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-destructive px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
      >
        Excluir workspace
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Para confirmar, digite o nome do workspace:{" "}
        <span className="font-semibold text-foreground">{workspaceName}</span>
      </p>
      <input
        type="text"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder={workspaceName}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
      />
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={handleDelete}
          disabled={confirm !== workspaceName || loading}
          className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Excluindo..." : "Confirmar exclusão"}
        </button>
        <button
          onClick={() => { setOpen(false); setConfirm(""); setError(null) }}
          disabled={loading}
          className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
