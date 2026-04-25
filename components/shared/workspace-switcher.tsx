"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const MOCK_WORKSPACES = [
  { id: "1", name: "Acme Corp", plan: "pro" as const },
  { id: "2", name: "Minha Consultoria", plan: "free" as const },
]

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(MOCK_WORKSPACES[0])

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
          {selected.name.charAt(0)}
        </div>
        <div className="flex flex-1 flex-col items-start overflow-hidden">
          <span className="truncate font-medium leading-none">{selected.name}</span>
          <span className="text-xs text-muted-foreground capitalize">{selected.plan}</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-md border border-border bg-background shadow-md">
            <div className="p-1">
              {MOCK_WORKSPACES.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => { setSelected(ws); setOpen(false) }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                    {ws.name.charAt(0)}
                  </div>
                  <span className="flex-1 truncate text-left">{ws.name}</span>
                  <Check className={cn("h-4 w-4", selected.id === ws.id ? "opacity-100" : "opacity-0")} />
                </button>
              ))}
            </div>
            <div className="border-t border-border p-1">
              <button className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
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
