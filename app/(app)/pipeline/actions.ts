"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE } from "@/lib/constants"

export type DealFormData = {
  title: string
  value: number
  stage: string
  lead_id: string
  due_date: string
  owner_id: string
}

export async function createDealAction(data: DealFormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return { error: "Workspace não encontrado" }

  const { error } = await supabase.from("deals").insert({
    title: data.title,
    value: data.value || 0,
    stage: data.stage,
    lead_id: data.lead_id || null,
    due_date: data.due_date || null,
    owner_id: data.owner_id || user.id,
    workspace_id: workspaceId,
  })

  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  return {}
}

export async function updateDealAction(dealId: string, data: DealFormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const { error } = await supabase.from("deals").update({
    title: data.title,
    value: data.value || 0,
    stage: data.stage,
    lead_id: data.lead_id || null,
    due_date: data.due_date || null,
    owner_id: data.owner_id,
  }).eq("id", dealId)

  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  return {}
}

export async function updateDealStageAction(dealId: string, stage: string) {
  const supabase = createClient()
  const { error } = await supabase.from("deals").update({ stage }).eq("id", dealId)
  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  return {}
}

export async function deleteDealAction(dealId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("deals").delete().eq("id", dealId)
  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  return {}
}
