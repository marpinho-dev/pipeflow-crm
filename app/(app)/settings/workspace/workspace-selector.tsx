"use client"

import { useWorkspace } from "@/components/providers/workspace-provider"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function WorkspaceSelector() {
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace()

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-base font-semibold text-foreground">Workspace ativo</h2>
      <div className="space-y-2">
        {workspaces.map((ws) => {
          const isActive = ws.id === activeWorkspace.id
          return (
            <button
              key={ws.id}
              onClick={() => switchWorkspace(ws.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                isActive
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                {ws.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className={cn("truncate font-medium", isActive && "text-foreground")}>{ws.name}</p>
                <p className="text-xs capitalize text-muted-foreground">{ws.plan}</p>
              </div>
              {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
