"use client"

import { useState } from "react"
import { updateWorkspaceAction } from "@/lib/actions/workspace"
import type { Workspace } from "@/types"

export function WorkspaceSettingsForm({
  workspace,
  isAdmin,
}: {
  workspace: Workspace
  isAdmin: boolean
}) {
  const [name, setName] = useState(workspace.name)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || name === workspace.name) return
    setMessage(null)
    setLoading(true)
    try {
      const result = await updateWorkspaceAction(workspace.id, name.trim())
      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else {
        setMessage({ type: "success", text: "Nome atualizado com sucesso." })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-base font-semibold text-foreground">Informações gerais</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="workspace-name" className="mb-1.5 block text-sm font-medium text-foreground">
            Nome do workspace
          </label>
          <input
            id="workspace-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isAdmin}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
          {!isAdmin && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Apenas administradores podem alterar o nome.
            </p>
          )}
        </div>

        {message && (
          <p className={`rounded-md px-3 py-2 text-sm ${
            message.type === "success"
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive"
          }`}>
            {message.text}
          </p>
        )}

        {isAdmin && (
          <button
            type="submit"
            disabled={loading || !name.trim() || name === workspace.name}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        )}
      </form>
    </div>
  )
}
