"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createWorkspaceAction } from "@/lib/actions/workspace"

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError("")
    setLoading(true)
    try {
      const result = await createWorkspaceAction(name.trim())
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
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Crie seu workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Um workspace é o espaço da sua empresa ou projeto no PipeFlow CRM.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
            Nome do workspace
          </label>
          <input
            id="name"
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Acme Corp ou Minha Consultoria"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar workspace e entrar"}
        </button>
      </form>
    </div>
  )
}
