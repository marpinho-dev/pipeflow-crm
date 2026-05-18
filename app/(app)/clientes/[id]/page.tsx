import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE } from "@/lib/constants"
import { ClienteDetailClient } from "./cliente-detail-client"

export default async function ClienteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) redirect("/onboarding")

  const [
    { data: cliente },
    { data: deals },
    { data: activities },
    { data: members },
  ] = await Promise.all([
    supabase.from("leads").select("*").eq("id", params.id).eq("workspace_id", workspaceId).single(),
    supabase.from("deals").select("*").eq("lead_id", params.id).eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from("activities").select("*").eq("lead_id", params.id).eq("workspace_id", workspaceId).order("activity_date", { ascending: false }),
    supabase.from("workspace_members").select("user_id, role").eq("workspace_id", workspaceId),
  ])

  if (!cliente) notFound()

  const authorIds = Array.from(new Set((activities ?? []).map((a: { author_id: string }) => a.author_id)))
  const { data: authorProfiles } = authorIds.length > 0
    ? await supabase.from("profiles").select("id, name, email").in("id", authorIds)
    : { data: [] }

  const ownerIds = Array.from(new Set((deals ?? []).map((d: { owner_id: string }) => d.owner_id)))
  const { data: ownerProfiles } = ownerIds.length > 0
    ? await supabase.from("profiles").select("id, name, email").in("id", ownerIds)
    : { data: [] }

  const memberUserIds = (members ?? []).map((m: { user_id: string }) => m.user_id)
  const { data: memberProfiles } = memberUserIds.length > 0
    ? await supabase.from("profiles").select("id, name, email").in("id", memberUserIds)
    : { data: [] }

  const activitiesWithAuthors = (activities ?? []).map((a: any) => ({
    ...a,
    author: authorProfiles?.find((p) => p.id === a.author_id) ?? null,
  }))

  const dealsWithOwners = (deals ?? []).map((d: any) => ({
    ...d,
    owner: ownerProfiles?.find((p) => p.id === d.owner_id) ?? null,
  }))

  const ownerProfile = memberProfiles?.find((p) => p.id === cliente.owner_id) ?? null
  const isAdmin = (members ?? []).some(
    (m: { user_id: string; role: string }) => m.user_id === user.id && m.role === "admin"
  )

  return (
    <ClienteDetailClient
      cliente={{ ...cliente, owner: ownerProfile }}
      deals={dealsWithOwners}
      activities={activitiesWithAuthors}
      memberProfiles={memberProfiles ?? []}
      currentUserId={user.id}
      isAdmin={isAdmin}
    />
  )
}
