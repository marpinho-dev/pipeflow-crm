"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkspace } from "@/components/providers/workspace-provider"

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleSwitch(id: string) {
    setOpen(false)
    await switchWorkspace(id)
  }

  return (
    <div
      className="relative"
      onKeyDown={(e) => { if (e.key === "Escape") setOpen(false) }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Workspace atual: ${activeWorkspace.name}`}
        className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
          {activeWorkspace.name.charAt(0)}
        </div>
        <div className="flex flex-1 flex-col items-start overflow-hidden">
          <span className="truncate font-medium leading-none">{activeWorkspace.name}</span>
          <span className="text-xs text-muted-foreground capitalize">{activeWorkspace.plan}</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div aria-hidden="true" className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            role="listbox"
            aria-label="Selecionar workspace"
            className="absolute left-0 top-full z-20 mt-1 w-full rounded-md border border-border bg-background shadow-md"
          >
            <div className="p-1">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  role="option"
                  aria-selected={activeWorkspace.id === ws.id}
                  onClick={() => handleSwitch(ws.id)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                    {ws.name.charAt(0)}
                  </div>
                  <span className="flex-1 truncate text-left">{ws.name}</span>
                  <Check className={cn("h-4 w-4", activeWorkspace.id === ws.id ? "opacity-100" : "opacity-0")} />
                </button>
              ))}
            </div>
            <div className="border-t border-border p-1">
              <button
                onClick={() => { setOpen(false); router.push("/onboarding") }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
                Novo workspace
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
