"use client"

import { createContext, useContext, useState } from "react"
import { useRouter } from "next/navigation"
import { switchWorkspaceAction } from "@/lib/actions/workspace"
import type { Workspace } from "@/types"

interface WorkspaceContextValue {
  workspaces: Workspace[]
  activeWorkspace: Workspace
  switchWorkspace: (id: string) => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({
  workspaces,
  activeWorkspace: initialActive,
  children,
}: {
  workspaces: Workspace[]
  activeWorkspace: Workspace
  children: React.ReactNode
}) {
  const [activeWorkspace, setActiveWorkspace] = useState(initialActive)
  const router = useRouter()

  async function switchWorkspace(id: string) {
    const ws = workspaces.find((w) => w.id === id)
    if (!ws || ws.id === activeWorkspace.id) return
    setActiveWorkspace(ws)
    await switchWorkspaceAction(id)
    router.refresh()
  }

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, switchWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider")
  return ctx
}
