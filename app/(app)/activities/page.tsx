import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE } from "@/lib/constants"
import { ActivitiesClient } from "./activities-client"

export default async function ActivitiesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return null

  const [activitiesResult, leadsResult, membersResult] = await Promise.all([
    supabase
      .from("activities")
      .select(`
        id, type, description, activity_date, completed, completed_at, lead_id, author_id,
        lead:leads(id, name)
      `)
      .eq("workspace_id", workspaceId)
      .order("activity_date", { ascending: false })
      .limit(300),

    supabase
      .from("leads")
      .select("id, name")
      .eq("workspace_id", workspaceId)
      .eq("status", "active")
      .order("name"),

    supabase
      .from("workspace_members")
      .select("user_id, profiles(id, name, email)")
      .eq("workspace_id", workspaceId),
  ])

  const activities = (activitiesResult.data ?? []) as any[]
  const leads = (leadsResult.data ?? []) as any[]
  const memberProfiles = (membersResult.data ?? []).map((m: any) => m.profiles).filter(Boolean) as any[]

  return (
    <ActivitiesClient
      activities={activities}
      leads={leads}
      memberProfiles={memberProfiles}
      currentUserId={user.id}
    />
  )
}
