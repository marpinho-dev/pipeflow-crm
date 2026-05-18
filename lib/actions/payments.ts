"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE } from "@/lib/constants"

export type MonthlyTotal = {
  year: number
  month: number
  total: number
}

export type InstallmentItem = {
  id: string
  lead_id: string
  lead_name: string
  installment_number: number
  amount: number
  due_date: string
  status: "pending" | "paid"
  paid_at: string | null
  is_overdue: boolean
}

export type LockedSummary = {
  total_value: number
  client_count: number
}

export type StoreFeeItem = {
  id: string
  store_id: string
  store_name: string
  client_name: string
  fee_amount: number
  payment_date: string
  is_overdue: boolean
}

export type PaymentsPageData = {
  projectionMonths: MonthlyTotal[]
  storeFeesProjection: MonthlyTotal[]
  monthlyList: InstallmentItem[]
  storeFeesMonthly: StoreFeeItem[]
  historyPaid: MonthlyTotal[]
  historyOverdue: MonthlyTotal[]
  locked: LockedSummary
}

const ACTIVE_STAGES = ["proposta_aceita", "obra_andamento", "obra_finalizada"]

export async function markInstallmentAsPaid(installmentId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return { error: "Nenhum workspace selecionado" }

  const { error } = await supabase
    .from("payment_installments")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", installmentId)
    .eq("workspace_id", workspaceId)

  if (error) return { error: error.message }

  revalidatePath("/payments")
  return { success: true }
}

export async function getPaymentsPageData(
  selectedMonth: number,
  selectedYear: number
): Promise<PaymentsPageData> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) {
    return {
      projectionMonths: [],
      storeFeesProjection: [],
      monthlyList: [],
      storeFeesMonthly: [],
      historyPaid: [],
      historyOverdue: [],
      locked: { total_value: 0, client_count: 0 },
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const projectionStart = new Date(selectedYear, selectedMonth - 1, 1)
  const projectionEnd = new Date(selectedYear, selectedMonth - 1 + 12, 0)
  const historyStart = new Date(selectedYear, selectedMonth - 1 - 11, 1)

  // Step 1: leads with a deal in proposta_aceita or later → fluxo ativo
  const { data: activeDeals } = await supabase
    .from("deals")
    .select("lead_id")
    .eq("workspace_id", workspaceId)
    .in("stage", ACTIVE_STAGES)
    .not("lead_id", "is", null)

  const activeLeadIds = Array.from(new Set((activeDeals ?? []).map((d) => d.lead_id as string)))

  // Step 2: fetch in parallel — installments for active leads + all leads with project_value + store fees
  const [
    { data: pendingInstallments },
    { data: paidInstallments },
    { data: allLeadsWithValue },
    { data: pendingStoreFees },
  ] = await Promise.all([
    activeLeadIds.length > 0
      ? supabase
          .from("payment_installments")
          .select("id, lead_id, installment_number, amount, due_date, status, paid_at, leads(name)")
          .eq("workspace_id", workspaceId)
          .eq("status", "pending")
          .in("lead_id", activeLeadIds)
          .order("due_date", { ascending: true })
      : Promise.resolve({ data: [] as any[] }),

    activeLeadIds.length > 0
      ? supabase
          .from("payment_installments")
          .select("id, lead_id, installment_number, amount, due_date, paid_at")
          .eq("workspace_id", workspaceId)
          .eq("status", "paid")
          .in("lead_id", activeLeadIds)
          .gte("paid_at", historyStart.toISOString())
      : Promise.resolve({ data: [] as any[] }),

    // All leads with a project value (to compute locked card)
    supabase
      .from("leads")
      .select("id, project_value")
      .eq("workspace_id", workspaceId)
      .not("project_value", "is", null)
      .gt("project_value", 0),

    // Pending store fees
    supabase
      .from("store_purchases")
      .select("id, store_id, client_name, fee_amount, purchase_date, stores(name)")
      .eq("workspace_id", workspaceId)
      .eq("fee_status", "pending")
      .order("purchase_date", { ascending: true }),
  ])

  // Step 3: locked = leads with project_value that are NOT in the active flow
  const lockedLeadsData = (allLeadsWithValue ?? []).filter(
    (l) => !activeLeadIds.includes(l.id)
  )
  const locked: LockedSummary = {
    total_value: lockedLeadsData.reduce((sum, l) => sum + (Number(l.project_value) || 0), 0),
    client_count: lockedLeadsData.length,
  }

  // Step 4: build projection chart — pending grouped by month (next 12 months)
  const projectionMap = new Map<string, number>()
  for (const inst of pendingInstallments ?? []) {
    const d = new Date(inst.due_date + "T00:00:00")
    if (d < projectionStart || d > projectionEnd) continue
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    projectionMap.set(key, (projectionMap.get(key) ?? 0) + Number(inst.amount))
  }
  const projectionMonths: MonthlyTotal[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(selectedYear, selectedMonth - 1 + i, 1)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    if (projectionMap.has(key)) {
      projectionMonths.push({ year: d.getFullYear(), month: d.getMonth() + 1, total: projectionMap.get(key)! })
    }
  }

  // Step 5: monthly list — pending for selected month + overdue from past months
  const pending = pendingInstallments ?? []

  const monthlyItems: InstallmentItem[] = pending
    .filter((inst) => {
      const d = new Date(inst.due_date + "T00:00:00")
      return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth
    })
    .map((inst) => {
      const dueDate = new Date(inst.due_date + "T00:00:00")
      const lead = inst.leads as unknown as { name: string } | null
      return {
        id: inst.id,
        lead_id: inst.lead_id,
        lead_name: lead?.name ?? "—",
        installment_number: inst.installment_number,
        amount: Number(inst.amount),
        due_date: inst.due_date,
        status: "pending" as const,
        paid_at: null,
        is_overdue: dueDate < today,
      }
    })

  const overdueItems: InstallmentItem[] = pending
    .filter((inst) => {
      const d = new Date(inst.due_date + "T00:00:00")
      return d < today && !(d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth)
    })
    .map((inst) => {
      const lead = inst.leads as unknown as { name: string } | null
      return {
        id: inst.id,
        lead_id: inst.lead_id,
        lead_name: lead?.name ?? "—",
        installment_number: inst.installment_number,
        amount: Number(inst.amount),
        due_date: inst.due_date,
        status: "pending" as const,
        paid_at: null,
        is_overdue: true,
      }
    })

  const monthlyList = [...overdueItems, ...monthlyItems].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )

  // Step 6: history charts — paid and overdue grouped by month (last 12 months)
  const historyPaidMap = new Map<string, number>()
  for (const inst of paidInstallments ?? []) {
    if (!inst.paid_at) continue
    const d = new Date(inst.paid_at)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    historyPaidMap.set(key, (historyPaidMap.get(key) ?? 0) + Number(inst.amount))
  }

  const historyOverdueMap = new Map<string, number>()
  for (const inst of pending) {
    const d = new Date(inst.due_date + "T00:00:00")
    if (d >= today || d < historyStart) continue
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    historyOverdueMap.set(key, (historyOverdueMap.get(key) ?? 0) + Number(inst.amount))
  }

  const historyPaid: MonthlyTotal[] = []
  const historyOverdue: MonthlyTotal[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(selectedYear, selectedMonth - 1 - i - 1, 1)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    historyPaid.push({ year: d.getFullYear(), month: d.getMonth() + 1, total: historyPaidMap.get(key) ?? 0 })
    historyOverdue.push({ year: d.getFullYear(), month: d.getMonth() + 1, total: historyOverdueMap.get(key) ?? 0 })
  }

  // Step 7: store fees projection (pending fees grouped by month, next 12 months)
  const storeFeesMap = new Map<string, number>()
  for (const fee of pendingStoreFees ?? []) {
    const d = new Date(fee.purchase_date + "T00:00:00")
    if (d < projectionStart || d > projectionEnd) continue
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    storeFeesMap.set(key, (storeFeesMap.get(key) ?? 0) + Number(fee.fee_amount))
  }
  const storeFeesProjection: MonthlyTotal[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(selectedYear, selectedMonth - 1 + i, 1)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    if (storeFeesMap.has(key)) {
      storeFeesProjection.push({ year: d.getFullYear(), month: d.getMonth() + 1, total: storeFeesMap.get(key)! })
    }
  }

  // Step 8: store fees monthly list — selected month + overdue
  function mapStoreFee(fee: any, overdue: boolean): StoreFeeItem {
    const store = fee.stores as unknown as { name: string } | null
    return {
      id: fee.id,
      store_id: fee.store_id,
      store_name: store?.name ?? "—",
      client_name: fee.client_name,
      fee_amount: Number(fee.fee_amount),
      payment_date: fee.purchase_date,
      is_overdue: overdue,
    }
  }

  const monthlyStoreFees = (pendingStoreFees ?? [])
    .filter((fee) => {
      const d = new Date(fee.purchase_date + "T00:00:00")
      return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth
    })
    .map((fee) => mapStoreFee(fee, new Date(fee.purchase_date + "T00:00:00") < today))

  const overdueStoreFees = (pendingStoreFees ?? [])
    .filter((fee) => {
      const d = new Date(fee.purchase_date + "T00:00:00")
      return d < today && !(d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth)
    })
    .map((fee) => mapStoreFee(fee, true))

  const storeFeesMonthly = [...overdueStoreFees, ...monthlyStoreFees].sort(
    (a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
  )

  return { projectionMonths, storeFeesProjection, monthlyList, storeFeesMonthly, historyPaid, historyOverdue, locked }
}
