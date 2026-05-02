import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WorkspaceSettingsForm } from "./workspace-settings-form"
import { WORKSPACE_COOKIE } from "@/lib/constants"
import type { Workspace } from "@/types"

export default async function WorkspaceSettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) redirect("/onboarding")

  const [workspaceResult, membershipResult] = await Promise.all([
    supabase.from("workspaces").select("*").eq("id", workspaceId).single(),
    supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single(),
  ])

  if (!workspaceResult.data) redirect("/dashboard")

  const workspace = workspaceResult.data as Workspace
  const isAdmin = membershipResult.data?.role === "admin"

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Workspace</h1>
        <p className="text-sm text-muted-foreground">Gerencie as configurações do seu workspace</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <WorkspaceSettingsForm workspace={workspace} isAdmin={isAdmin} />

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-1 text-base font-semibold text-foreground">Plano atual</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {workspace.plan === "pro"
              ? "Plano Pro — colaboradores ilimitados e leads ilimitados"
              : "Plano Free — até 2 colaboradores e 50 leads"}
          </p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-sm font-medium capitalize">
              {workspace.plan}
            </span>
            {workspace.plan === "free" && (
              <span className="text-sm text-muted-foreground">
                Upgrade disponível em Cobrança
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
