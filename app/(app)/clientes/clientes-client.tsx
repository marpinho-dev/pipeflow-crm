"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Plus, Search, Pencil, Trash2, AlertTriangle, ChevronLeft, ChevronRight, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteClienteAction } from "@/lib/actions/clientes"
import { FREE_PLAN_LIMIT } from "@/lib/constants"
import { ClienteModal } from "./cliente-modal"

interface Profile {
  id: string
  name: string | null
  email: string
}

interface Cliente {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  role: string | null
  owner_id: string
  created_at: string
  stage: string
  owner: Profile | null
}

const STAGE_LABELS: Record<string, { label: string; className: string }> = {
  novo_cliente:        { label: "Novo Cliente",        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  apresentar_proposta: { label: "Apresentar Proposta", className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  proposta_aceita:     { label: "Proposta Aceita",     className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  obra_andamento:      { label: "Obra em Andamento",   className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  obra_finalizada:     { label: "Obra Finalizada",     className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cliente_perdido:     { label: "Cliente Perdido",     className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  cliente_stand_by:    { label: "Stand By",            className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
}

export function ClientesClient({
  clientes,
  totalCount,
  totalClienteCount,
  page,
  pageSize,
  memberProfiles,
  workspacePlan,
  currentUserId,
  isAdmin,
  filters,
}: {
  clientes: Cliente[]
  totalCount: number
  totalClienteCount: number
  page: number
  pageSize: number
  memberProfiles: Profile[]
  workspacePlan: string
  currentUserId: string
  isAdmin: boolean
  filters: { q: string; owner: string }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchInput, setSearchInput] = useState(filters.q)
  const [modalCliente, setModalCliente] = useState<Cliente | null | "new">(null)
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const atLimit = workspacePlan === "free" && totalClienteCount >= FREE_PLAN_LIMIT
  const nearLimit = workspacePlan === "free" && totalClienteCount >= FREE_PLAN_LIMIT * 0.8 && !atLimit
  const totalPages = Math.ceil(totalCount / pageSize)

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v)
        else params.delete(k)
      })
      router.replace(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.q) updateParams({ q: searchInput, page: "" })
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, filters.q, updateParams])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteClienteAction(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold leading-none">Clientes</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {totalClienteCount} cliente{totalClienteCount !== 1 ? "s" : ""}
            {workspacePlan === "free" && ` / ${FREE_PLAN_LIMIT} (plano Free)`}
          </p>
        </div>
        <button
          onClick={() => setModalCliente("new")}
          disabled={atLimit}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Novo cliente
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {atLimit && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Limite de {FREE_PLAN_LIMIT} clientes atingido. Faça upgrade para o plano Pro para adicionar mais.</span>
          </div>
        )}
        {nearLimit && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-50 px-4 py-3 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Você usou {totalClienteCount} de {FREE_PLAN_LIMIT} clientes do plano Free.</span>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nome, e-mail ou empresa..."
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={filters.owner}
            onChange={(e) => updateParams({ owner: e.target.value, page: "" })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todos os responsáveis</option>
            {memberProfiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name ?? p.email}</option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Empresa</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">E-mail</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Etapa</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Responsável</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Criado em</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      {filters.q || filters.owner ? (
                        <div className="flex flex-col items-center justify-center py-14 text-center">
                          <Search className="mb-3 h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm font-medium text-foreground">Nenhum cliente encontrado</p>
                          <p className="mt-1 text-xs text-muted-foreground">Tente ajustar os filtros de busca.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-14 text-center">
                          <Users className="mb-3 h-10 w-10 text-muted-foreground/30" />
                          <p className="text-sm font-medium text-foreground">Nenhum cliente ainda</p>
                          <p className="mt-1 text-xs text-muted-foreground">Comece adicionando seu primeiro cliente.</p>
                          <button
                            onClick={() => setModalCliente("new")}
                            disabled={atLimit}
                            className="mt-4 flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Novo cliente
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => {
                    const stage = STAGE_LABELS[cliente.stage] ?? STAGE_LABELS.novo_cliente
                    return (
                      <tr key={cliente.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/clientes/${cliente.id}`} className="hover:underline">
                            <div className="font-medium text-foreground">{cliente.name}</div>
                            {cliente.role && <div className="text-xs text-muted-foreground">{cliente.role}</div>}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{cliente.company ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{cliente.email ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", stage.className)}>
                            {stage.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                          {cliente.owner?.name ?? cliente.owner?.email ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                          {new Date(cliente.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => setModalCliente(cliente)}
                              className="rounded p-2 sm:p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                              aria-label="Editar cliente"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(cliente)}
                              className="rounded p-2 sm:p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label="Excluir cliente"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} de {totalCount}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => updateParams({ page: String(page - 1) })} disabled={page === 1} className="rounded p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  return (
                    <button key={p} onClick={() => updateParams({ page: String(p) })} className={cn("h-7 w-7 rounded text-sm font-medium", p === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>
                      {p}
                    </button>
                  )
                })}
                <button onClick={() => updateParams({ page: String(page + 1) })} disabled={page === totalPages} className="rounded p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalCliente !== null && (
        <ClienteModal
          cliente={modalCliente === "new" ? null : modalCliente}
          memberProfiles={memberProfiles}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onClose={() => setModalCliente(null)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-2 text-base font-semibold text-foreground">Excluir cliente</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Tem certeza que deseja excluir <strong>{deleteTarget.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent">Cancelar</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50">
                {deleteLoading ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
