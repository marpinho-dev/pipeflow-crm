"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE } from "@/lib/constants"
import type { StoreFormData } from "@/types"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateStore(data: StoreFormData) {
  if (!data.name || data.name.trim().length < 1 || data.name.length > 255) {
    return "Nome deve ter entre 1 e 255 caracteres"
  }
  if (data.email && (!EMAIL_REGEX.test(data.email) || data.email.length > 255)) {
    return "E-mail inválido"
  }
  if (data.phone && data.phone.length > 50) {
    return "Telefone muito longo"
  }
  if (data.referral_percentage < 0 || data.referral_percentage > 100) {
    return "Percentual deve estar entre 0 e 100"
  }
  return null
}

export async function createStoreAction(data: StoreFormData) {
  const err = validateStore(data)
  if (err) return { error: err }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return { error: "Nenhum workspace selecionado" }

  const { error } = await supabase.from("stores").insert({
    workspace_id: workspaceId,
    name: data.name.trim(),
    email: data.email || null,
    phone: data.phone || null,
    referral_percentage: data.referral_percentage,
    sales_volume: data.sales_volume,
  })

  if (error) return { error: error.message }

  revalidatePath("/lojas")
  return { success: true }
}

export async function updateStoreAction(storeId: string, data: StoreFormData) {
  const err = validateStore(data)
  if (err) return { error: err }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return { error: "Nenhum workspace selecionado" }

  const { error } = await supabase
    .from("stores")
    .update({
      name: data.name.trim(),
      email: data.email || null,
      phone: data.phone || null,
      referral_percentage: data.referral_percentage,
      sales_volume: data.sales_volume,
    })
    .eq("id", storeId)
    .eq("workspace_id", workspaceId)

  if (error) return { error: error.message }

  revalidatePath("/lojas")
  revalidatePath(`/lojas/${storeId}`)
  return { success: true }
}

export async function deleteStoreAction(storeId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return { error: "Nenhum workspace selecionado" }

  const { error } = await supabase
    .from("stores")
    .delete()
    .eq("id", storeId)
    .eq("workspace_id", workspaceId)

  if (error) return { error: error.message }

  revalidatePath("/lojas")
  return { success: true }
}

export type StorePaymentsData = {
  projectionMonths: { year: number; month: number; total: number }[]
  monthlyList: {
    id: string
    lead_id: string
    lead_name: string
    installment_number: number
    amount: number
    due_date: string
    is_overdue: boolean
  }[]
  historyPaid: { year: number; month: number; total: number }[]
  historyOverdue: { year: number; month: number; total: number }[]
  totalReceived: number
  totalPending: number
  linkedLeadsCount: number
}

export async function getStorePaymentsData(
  storeId: string,
  selectedMonth: number,
  selectedYear: number
): Promise<StorePaymentsData> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) {
    return {
      projectionMonths: [], monthlyList: [], historyPaid: [], historyOverdue: [],
      totalReceived: 0, totalPending: 0, linkedLeadsCount: 0,
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const projectionStart = new Date(selectedYear, selectedMonth - 1, 1)
  const projectionEnd = new Date(selectedYear, selectedMonth - 1 + 12, 0)
  const historyStart = new Date(selectedYear, selectedMonth - 1 - 11, 1)

  // Leads vinculados a esta loja
  const { data: linkedLeads } = await supabase
    .from("leads")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("store_id", storeId)

  const leadIds = (linkedLeads ?? []).map((l) => l.id)

  if (leadIds.length === 0) {
    const emptyHistory = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(selectedYear, selectedMonth - 1 - i - 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() + 1, total: 0 }
    }).reverse()
    return {
      projectionMonths: [], monthlyList: [], historyPaid: emptyHistory, historyOverdue: emptyHistory,
      totalReceived: 0, totalPending: 0, linkedLeadsCount: 0,
    }
  }

  const [
    { data: pendingInstallments },
    { data: paidInstallments },
  ] = await Promise.all([
    supabase
      .from("payment_installments")
      .select("id, lead_id, installment_number, amount, due_date, leads(name)")
      .eq("workspace_id", workspaceId)
      .eq("status", "pending")
      .in("lead_id", leadIds)
      .order("due_date", { ascending: true }),
    supabase
      .from("payment_installments")
      .select("id, amount, paid_at")
      .eq("workspace_id", workspaceId)
      .eq("status", "paid")
      .in("lead_id", leadIds)
      .gte("paid_at", historyStart.toISOString()),
  ])

  // Projeção — parcelas pendentes agrupadas por mês (próximos 12 meses)
  const projectionMap = new Map<string, number>()
  for (const inst of pendingInstallments ?? []) {
    const d = new Date(inst.due_date + "T00:00:00")
    if (d < projectionStart || d > projectionEnd) continue
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    projectionMap.set(key, (projectionMap.get(key) ?? 0) + Number(inst.amount))
  }
  const projectionMonths = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(selectedYear, selectedMonth - 1 + i, 1)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    if (projectionMap.has(key)) {
      projectionMonths.push({ year: d.getFullYear(), month: d.getMonth() + 1, total: projectionMap.get(key)! })
    }
  }

  // Lista do mês + atrasadas
  const pending = pendingInstallments ?? []
  const monthlyItems = pending
    .filter((inst) => {
      const d = new Date(inst.due_date + "T00:00:00")
      return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth
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
        is_overdue: new Date(inst.due_date + "T00:00:00") < today,
      }
    })

  const overdueItems = pending
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
        is_overdue: true,
      }
    })

  const monthlyList = [...overdueItems, ...monthlyItems].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )

  // Histórico — pago e atrasado agrupados por mês (últimos 12 meses)
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

  const historyPaid = []
  const historyOverdue = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(selectedYear, selectedMonth - 1 - i - 1, 1)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    historyPaid.push({ year: d.getFullYear(), month: d.getMonth() + 1, total: historyPaidMap.get(key) ?? 0 })
    historyOverdue.push({ year: d.getFullYear(), month: d.getMonth() + 1, total: historyOverdueMap.get(key) ?? 0 })
  }

  const totalReceived = (paidInstallments ?? []).reduce((s, i) => s + Number(i.amount), 0)
  const totalPending = pending.reduce((s, i) => s + Number(i.amount), 0)

  return {
    projectionMonths,
    monthlyList,
    historyPaid,
    historyOverdue,
    totalReceived,
    totalPending,
    linkedLeadsCount: leadIds.length,
  }
}
