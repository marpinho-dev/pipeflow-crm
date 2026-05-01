import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/shared/header"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { FunnelChart } from "@/components/dashboard/funnel-chart"
import { UpcomingDeals } from "@/components/dashboard/upcoming-deals"
import { WORKSPACE_COOKIE } from "@/lib/constants"

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) redirect("/onboarding")

  const fourteenDaysFromNow = new Date()
  fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14)

  const [
    { count: totalLeads },
    { data: allDeals },
    { data: upcomingRaw },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),

    supabase
      .from("deals")
      .select("stage, value")
      .eq("workspace_id", workspaceId),

    supabase
      .from("deals")
      .select("id, title, value, stage, due_date, lead_id")
      .eq("workspace_id", workspaceId)
      .not("due_date", "is", null)
      .not("stage", "in", '("closed_won","closed_lost")')
      .lte("due_date", fourteenDaysFromNow.toISOString().split("T")[0])
      .order("due_date", { ascending: true })
      .limit(5),
  ])

  // Enrich upcoming deals with lead names
  const leadIds = (upcomingRaw ?? [])
    .map((d: { lead_id: string | null }) => d.lead_id)
    .filter(Boolean) as string[]

  const { data: leadNames } = leadIds.length > 0
    ? await supabase.from("leads").select("id, name").in("id", leadIds)
    : { data: [] }

  const upcomingDeals = (upcomingRaw ?? []).map((d) => ({
    ...(d as { id: string; title: string; value: number; stage: string; due_date: string; lead_id: string | null }),
    lead: leadNames?.find((l) => l.id === (d as { lead_id: string | null }).lead_id) ?? null,
  }))

  // Compute metrics from allDeals
  const deals = allDeals ?? []
  const openDeals = deals.filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost")
  const closedWon = deals.filter((d) => d.stage === "closed_won").length
  const closedLost = deals.filter((d) => d.stage === "closed_lost").length
  const closedTotal = closedWon + closedLost
  const conversionRate = closedTotal > 0 ? (closedWon / closedTotal) * 100 : 0
  const pipelineValue = openDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)

  // Build per-stage stats for the funnel chart
  const stageMap: Record<string, { count: number; value: number }> = {}
  for (const deal of deals) {
    if (!stageMap[deal.stage]) stageMap[deal.stage] = { count: 0, value: 0 }
    stageMap[deal.stage].count++
    stageMap[deal.stage].value += Number(deal.value) || 0
  }
  const stageStats = Object.entries(stageMap).map(([stage, stats]) => ({ stage, ...stats }))

  return (
    <>
      <Header title="Dashboard" description="Visão geral do seu pipeline de vendas" />
      <div className="space-y-6 p-6">
        <MetricCards
          totalLeads={totalLeads ?? 0}
          openDeals={openDeals.length}
          pipelineValue={pipelineValue}
          conversionRate={conversionRate}
        />

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Funnel chart — wider */}
          <div className="lg:col-span-3 rounded-xl border border-border bg-card p-5 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <h2 className="mb-4 text-sm font-semibold">Funil de Vendas</h2>
            <FunnelChart data={stageStats} />
          </div>

          {/* Upcoming deals */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <h2 className="mb-4 text-sm font-semibold">Fechamentos Próximos</h2>
            <UpcomingDeals deals={upcomingDeals} />
          </div>
        </div>
      </div>
    </>
  )
}
