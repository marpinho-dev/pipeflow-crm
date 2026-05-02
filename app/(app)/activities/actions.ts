"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE } from "@/lib/constants"
import type { ActivityType } from "@/types"

const VALID_ACTIVITY_TYPES: ActivityType[] = ["call", "email", "meeting", "note"]

export async function createActivityAction(data: {
  leadId: string
  type: ActivityType
  description: string
  activityDate: string
}) {
  if (!VALID_ACTIVITY_TYPES.includes(data.type)) {
    return { error: "Tipo de atividade inválido" }
  }
  const trimmedDescription = data.description?.trim() ?? ""
  if (trimmedDescription.length < 1 || trimmedDescription.length > 5000) {
    return { error: "Descrição deve ter entre 1 e 5000 caracteres" }
  }
  if (!data.activityDate || isNaN(Date.parse(data.activityDate))) {
    return { error: "Data inválida" }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return { error: "Workspace não encontrado" }

  const { error } = await supabase.from("activities").insert({
    workspace_id: workspaceId,
    lead_id: data.leadId,
    author_id: user.id,
    type: data.type,
    description: trimmedDescription,
    activity_date: data.activityDate,
  })

  if (error) return { error: error.message }

  revalidatePath("/activities")
  revalidatePath("/leads/[id]", "page")
  return { success: true }
}

export async function completeActivityAction(activityId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const { error } = await supabase
    .from("activities")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("id", activityId)

  if (error) return { error: error.message }

  revalidatePath("/activities")
  revalidatePath("/leads/[id]", "page")
  return { success: true }
}

export async function uncompleteActivityAction(activityId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const { error } = await supabase
    .from("activities")
    .update({ completed: false, completed_at: null })
    .eq("id", activityId)

  if (error) return { error: error.message }

  revalidatePath("/activities")
  revalidatePath("/leads/[id]", "page")
  return { success: true }
}

export async function deleteActivityAction(activityId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const { error } = await supabase.from("activities").delete().eq("id", activityId)

  if (error) return { error: error.message }

  revalidatePath("/activities")
  revalidatePath("/leads/[id]", "page")
  return { success: true }
}
