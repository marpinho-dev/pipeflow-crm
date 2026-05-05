import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/shared/header"
import { PaymentsClient } from "./payments-client"
import { getPaymentsPageData } from "@/lib/actions/payments"
import { WORKSPACE_COOKIE } from "@/lib/constants"

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) redirect("/onboarding")

  const now = new Date()
  const selectedMonth = parseInt(searchParams.month ?? String(now.getMonth() + 1), 10)
  const selectedYear = parseInt(searchParams.year ?? String(now.getFullYear()), 10)

  const data = await getPaymentsPageData(selectedMonth, selectedYear)

  return (
    <>
      <Header
        title="Fluxo de Pagamento"
        description="Acompanhe os recebimentos programados e o histórico de caixa"
      />
      <PaymentsClient
        data={data}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </>
  )
}
