"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE } from "@/lib/constants"
import type { StoreFormData } from "@/types"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateStore(data: StoreFormData) {
  if (!data.name || data.name.trim().length < 1 || data.name.length > 255)
    return "Nome deve ter entre 1 e 255 caracteres"
  if (data.email && (!EMAIL_REGEX.test(data.email) || data.email.length > 255))
    return "E-mail inválido"
  if (data.phone && data.phone.length > 50)
    return "Telefone muito longo"
  if (data.referral_percentage < 0 || data.referral_percentage > 100)
    return "Percentual deve estar entre 0 e 100"
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

export type StorePurchase = {
  id: string
  store_id: string
  client_name: string
  amount: number
  purchase_date: string
  fee_amount: number
  fee_status: "pending" | "paid"
  fee_paid_at: string | null
  notes: string | null
  created_at: string
}

export type PurchaseFormData = {
  client_name: string
  amount: number
  purchase_date: string
  fee_amount: number
  notes?: string
}

export async function createPurchaseAction(storeId: string, data: PurchaseFormData) {
  if (!data.client_name.trim()) return { error: "Nome do cliente é obrigatório" }
  if (!data.purchase_date) return { error: "Data da compra é obrigatória" }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return { error: "Nenhum workspace selecionado" }

  const { error } = await supabase.from("store_purchases").insert({
    workspace_id: workspaceId,
    store_id: storeId,
    client_name: data.client_name.trim(),
    amount: data.amount,
    purchase_date: data.purchase_date,
    fee_amount: data.fee_amount,
    fee_status: "pending",
    notes: data.notes || null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/lojas/${storeId}`)
  return { success: true }
}

export async function markFeeAsPaidAction(purchaseId: string, storeId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return { error: "Nenhum workspace selecionado" }

  const { error } = await supabase
    .from("store_purchases")
    .update({ fee_status: "paid", fee_paid_at: new Date().toISOString() })
    .eq("id", purchaseId)
    .eq("workspace_id", workspaceId)

  if (error) return { error: error.message }

  revalidatePath(`/lojas/${storeId}`)
  return { success: true }
}

export async function deletePurchaseAction(purchaseId: string, storeId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return { error: "Nenhum workspace selecionado" }

  const { error } = await supabase
    .from("store_purchases")
    .delete()
    .eq("id", purchaseId)
    .eq("workspace_id", workspaceId)

  if (error) return { error: error.message }

  revalidatePath(`/lojas/${storeId}`)
  return { success: true }
}
