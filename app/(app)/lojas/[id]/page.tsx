import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE } from "@/lib/constants"
import { getStorePaymentsData } from "@/lib/actions/stores"
import { StoreDetailClient } from "./store-detail-client"

export default async function StoreDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { month?: string; year?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) redirect("/onboarding")

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", params.id)
    .eq("workspace_id", workspaceId)
    .single()

  if (!store) notFound()

  const now = new Date()
  const selectedMonth = parseInt(searchParams.month ?? String(now.getMonth() + 1), 10)
  const selectedYear = parseInt(searchParams.year ?? String(now.getFullYear()), 10)

  const paymentsData = await getStorePaymentsData(params.id, selectedMonth, selectedYear)

  return (
    <StoreDetailClient
      store={store}
      paymentsData={paymentsData}
      selectedMonth={selectedMonth}
      selectedYear={selectedYear}
    />
  )
}
