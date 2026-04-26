import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MembersClient } from "./members-client"
import { WORKSPACE_COOKIE } from "@/lib/constants"

export default async function MembersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) redirect("/onboarding")

  const [membersResult, invitesResult, myMembershipResult] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("id, role, created_at, user_id")
      .eq("workspace_id", workspaceId)
      .order("created_at"),
    supabase
      .from("invites")
      .select("id, email, role, created_at, expires_at")
      .eq("workspace_id", workspaceId)
      .is("accepted_at", null)
      .order("created_at"),
    supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single(),
  ])

  if (!myMembershipResult.data) redirect("/dashboard")

  const members = membersResult.data ?? []
  const pendingInvites = invitesResult.data ?? []
  const isAdmin = myMembershipResult.data.role === "admin"

  const userIds = members.map((m) => m.user_id)
  const { data: profiles } = userIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, email, name, avatar_url")
        .in("id", userIds)
    : { data: [] }

  const membersWithProfiles = members.map((m) => ({
    ...m,
    profile: profiles?.find((p) => p.id === m.user_id) ?? null,
  }))

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Membros</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie os membros e convites do seu workspace
        </p>
      </div>

      <div className="max-w-2xl">
        <MembersClient
          members={membersWithProfiles}
          pendingInvites={pendingInvites}
          workspaceId={workspaceId}
          currentUserId={user.id}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}
