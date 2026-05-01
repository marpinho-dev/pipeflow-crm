import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/shared/header"
import { PipelineClient } from "./pipeline-client"
import { WORKSPACE_COOKIE } from "@/lib/constants"

export default async function PipelinePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) redirect("/onboarding")

  const [
    { data: dealsRaw },
    { data: leadsRaw },
    { data: members },
  ] = await Promise.all([
    supabase
      .from("deals")
      .select("id, title, value, stage, due_date, lead_id, owner_id")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),

    supabase
      .from("leads")
      .select("id, name")
      .eq("workspace_id", workspaceId)
      .eq("status", "active")
      .order("name"),

    supabase
      .from("workspace_members")
      .select("user_id, role")
      .eq("workspace_id", workspaceId),
  ])

  const memberUserIds = (members ?? []).map((m: { user_id: string }) => m.user_id)
  const { data: profiles } = memberUserIds.length > 0
    ? await supabase.from("profiles").select("id, name, email").in("id", memberUserIds)
    : { data: [] }

  // Enrich deals with lead name and owner profile
  const leadMap = Object.fromEntries((leadsRaw ?? []).map((l) => [l.id, l]))
  const ownerMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  const deals = (dealsRaw ?? []).map((d) => ({
    ...d,
    lead:  d.lead_id ? (leadMap[d.lead_id] ?? null)  : null,
    owner: ownerMap[d.owner_id] ?? null,
  }))

  const isAdmin = (members ?? []).some(
    (m: { user_id: string; role: string }) => m.user_id === user.id && m.role === "admin"
  )

  return (
    <>
      <Header title="Pipeline" description="Acompanhe seus negócios por etapa" />
      <PipelineClient
        initialDeals={deals}
        leads={leadsRaw ?? []}
        memberProfiles={profiles ?? []}
        currentUserId={user.id}
        isAdmin={isAdmin}
      />
    </>
  )
}
