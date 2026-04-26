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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workspaces: Workspace[] = (memberships ?? []).map((m: any) => m.workspaces).filter(Boolean)

  if (workspaces.length === 0) redirect("/onboarding")

  const storedId = cookies().get(WORKSPACE_COOKIE)?.value
  const activeWorkspace = workspaces.find((w) => w.id === storedId) ?? workspaces[0]

  return (
    <WorkspaceProvider workspaces={workspaces} activeWorkspace={activeWorkspace}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-y-auto pt-14 md:pt-0">
          {children}
        </main>
      </div>
    </WorkspaceProvider>
  )
}
