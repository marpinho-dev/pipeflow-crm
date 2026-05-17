import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StoresClient } from "./stores-client"
import { WORKSPACE_COOKIE } from "@/lib/constants"

const PAGE_SIZE = 20

export default async function LojasPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) redirect("/onboarding")

  const page = Math.max(1, parseInt(searchParams.page ?? "1"))
  const offset = (page - 1) * PAGE_SIZE

  let query: any = supabase
    .from("stores")
    .select("*", { count: "exact" })
    .eq("workspace_id", workspaceId)

  if (searchParams.q) {
    const q = searchParams.q
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data: stores, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  return (
    <StoresClient
      stores={stores ?? []}
      totalCount={count ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      filters={{ q: searchParams.q ?? "" }}
    />
  )
}
