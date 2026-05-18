import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE } from "@/lib/constants"
import { StoreDetailClient } from "./store-detail-client"

export default async function StoreDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) redirect("/onboarding")

  const [{ data: store }, { data: purchases }, { data: leads }] = await Promise.all([
    supabase
      .from("stores")
      .select("*")
      .eq("id", params.id)
      .eq("workspace_id", workspaceId)
      .single(),
    supabase
      .from("store_purchases")
      .select("*")
      .eq("store_id", params.id)
      .eq("workspace_id", workspaceId)
      .order("purchase_date", { ascending: false }),
    supabase
      .from("leads")
      .select("name")
      .eq("workspace_id", workspaceId)
      .order("name", { ascending: true }),
  ])

  if (!store) notFound()

  const clientNames = (leads ?? []).map((l: { name: string }) => l.name)

  return (
    <StoreDetailClient
      store={store}
      purchases={purchases ?? []}
      clientNames={clientNames}
    />
  )
}
