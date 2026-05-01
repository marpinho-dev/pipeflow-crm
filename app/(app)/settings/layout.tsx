import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE } from "@/lib/constants"
import { SettingsNav } from "@/components/shared/settings-nav"

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) redirect("/dashboard")

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single()

  if (membership?.role !== "admin") redirect("/dashboard")

  return (
    <div className="flex h-full">
      <aside className="hidden md:block w-48 shrink-0 border-r border-border p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Configurações
        </p>
        <SettingsNav />
      </aside>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
