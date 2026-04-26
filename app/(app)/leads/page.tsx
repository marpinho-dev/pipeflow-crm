import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LeadsClient } from "./leads-client"
import { WORKSPACE_COOKIE } from "@/lib/constants"

const PAGE_SIZE = 20

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; owner?: string; page?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) redirect("/onboarding")

  const page = Math.max(1, parseInt(searchParams.page ?? "1"))
  const offset = (page - 1) * PAGE_SIZE

  // Build filtered query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .eq("workspace_id", workspaceId)

  if (searchParams.q) {
    const q = searchParams.q
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%`)
  }
  if (searchParams.status) query = query.eq("status", searchParams.status)
  if (searchParams.owner) query = query.eq("owner_id", searchParams.owner)

  const [
    { data: leads, count },
    { count: totalLeadCount },
    { data: members },
    { data: workspace },
  ] = await Promise.all([
    query.order("created_at", { ascending: false }).range(offset, offset + PAGE_SIZE - 1),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("workspace_members").select("user_id, role").eq("workspace_id", workspaceId),
    supabase.from("workspaces").select("plan").eq("id", workspaceId).single(),
  ])

  // Fetch profiles for lead owners
  const ownerIds = Array.from(new Set((leads ?? []).map((l: { owner_id: string }) => l.owner_id)))
  const { data: ownerProfiles } = ownerIds.length > 0
    ? await supabase.from("profiles").select("id, name, email").in("id", ownerIds)
    : { data: [] }

  // Fetch profiles for workspace members (owner filter dropdown)
  const memberUserIds = (members ?? []).map((m: { user_id: string }) => m.user_id)
  const { data: memberProfiles } = memberUserIds.length > 0
    ? await supabase.from("profiles").select("id, name, email").in("id", memberUserIds)
    : { data: [] }

  const leadsWithOwners = (leads ?? []).map((l: { owner_id: string }) => ({
    ...l,
    owner: ownerProfiles?.find((p) => p.id === (l as { owner_id: string }).owner_id) ?? null,
  }))

  const isAdmin = (members ?? []).some(
    (m: { user_id: string; role: string }) => m.user_id === user.id && m.role === "admin"
  )

  return (
    <LeadsClient
      leads={leadsWithOwners}
      totalCount={count ?? 0}
      totalLeadCount={totalLeadCount ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      memberProfiles={memberProfiles ?? []}
      workspacePlan={workspace?.plan ?? "free"}
      currentUserId={user.id}
      isAdmin={isAdmin}
      filters={{
        q: searchParams.q ?? "",
        status: searchParams.status ?? "",
        owner: searchParams.owner ?? "",
      }}
    />
  )
}
