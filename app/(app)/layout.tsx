import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/shared/sidebar"
import { WorkspaceProvider } from "@/components/providers/workspace-provider"
import { WORKSPACE_COOKIE } from "@/lib/constants"
import type { Workspace } from "@/types"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Ensure the user has a profile row (handles users created before the trigger)
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
    },
    { onConflict: "id", ignoreDuplicates: true }
  )

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces (id, name, slug, plan, stripe_customer_id, stripe_subscription_id, created_at)")
    .eq("user_id", user.id)

  const workspaces: Workspace[] = (memberships ?? []).map((m: any) => m.workspaces).filter(Boolean)

  if (workspaces.length === 0) redirect("/onboarding")

  const storedId = cookies().get(WORKSPACE_COOKIE)?.value
  const activeWorkspace = workspaces.find((w) => w.id === storedId) ?? workspaces[0]

  const activeMembership = (memberships ?? []).find((m: any) => m.workspace_id === activeWorkspace.id)
  const isAdmin = (activeMembership as any)?.role === "admin"

  // Badge: atividades atrasadas + de hoje não concluídas
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)
  const { count: activityBadge } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", activeWorkspace.id)
    .eq("completed", false)
    .lte("activity_date", todayEnd.toISOString())

  return (
    <WorkspaceProvider workspaces={workspaces} activeWorkspace={activeWorkspace}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar isAdmin={isAdmin} activityBadge={activityBadge ?? 0} />
        <main className="animate-page-enter flex flex-1 flex-col overflow-y-auto pt-14 md:pt-0">
          {children}
        </main>
      </div>
    </WorkspaceProvider>
  )
}
