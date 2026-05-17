"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Plus, Search, Pencil, Trash2, Store, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteStoreAction } from "@/lib/actions/stores"
import { StoreModal } from "./store-modal"
import type { Store as StoreType } from "@/types"

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

export function StoresClient({
  stores,
  totalCount,
  page,
  pageSize,
  filters,
}: {
  stores: StoreType[]
  totalCount: number
  page: number
  pageSize: number
  filters: { q: string }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchInput, setSearchInput] = useState(filters.q)
  const [modalStore, setModalStore] = useState<StoreType | null | "new">(null)
  const [deleteTarget, setDeleteTarget] = useState<StoreType | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

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
      if (searchInput !== filters.q) {
        updateParams({ q: searchInput, page: "" })
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, filters.q, updateParams])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteStoreAction(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold leading-none">Lojas Parceiras</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {totalCount} loja{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setModalStore("new")}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nova loja
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Busca */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Tabela */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">E-mail</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Telefone</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">% Indicação</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Vol. Vendas</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      {filters.q ? (
                        <div className="flex flex-col items-center justify-center py-14 text-center">
                          <Search className="mb-3 h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm font-medium text-foreground">Nenhuma loja encontrada</p>
                          <p className="mt-1 text-xs text-muted-foreground">Tente ajustar a busca.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-14 text-center">
                          <Store className="mb-3 h-10 w-10 text-muted-foreground/30" />
                          <p className="text-sm font-medium text-foreground">Nenhuma loja ainda</p>
                          <p className="mt-1 text-xs text-muted-foreground">Cadastre sua primeira loja parceira.</p>
                          <button
                            onClick={() => setModalStore("new")}
                            className="mt-4 flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Nova loja
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr key={store.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/lojas/${store.id}`} className="font-medium text-foreground hover:underline">
                          {store.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {store.email ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {store.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {Number(store.referral_percentage).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        {formatBRL(Number(store.sales_volume))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setModalStore(store)}
                            className="rounded p-2 sm:p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                            aria-label="Editar loja"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(store)}
                            className="rounded p-2 sm:p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Excluir loja"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
                <button
                  onClick={() => updateParams({ page: String(page - 1) })}
                  disabled={page === 1}
                  className="rounded p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  return (
                    <button
                      key={p}
                      onClick={() => updateParams({ page: String(p) })}
                      className={cn(
                        "h-7 w-7 rounded text-sm font-medium",
                        p === page
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => updateParams({ page: String(page + 1) })}
                  disabled={page === totalPages}
                  className="rounded p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalStore !== null && (
        <StoreModal
          store={modalStore === "new" ? null : modalStore}
          onClose={() => setModalStore(null)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-2 text-base font-semibold text-foreground">Excluir loja</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Tem certeza que deseja excluir <strong>{deleteTarget.name}</strong>? Os leads vinculados a ela não serão removidos.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
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
