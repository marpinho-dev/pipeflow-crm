"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE } from "@/lib/constants"
import type { ActivityType } from "@/types"

export async function createActivityAction(data: {
  leadId: string
  type: ActivityType
  description: string
  activityDate: string
}) {
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
    description: data.description.trim(),
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
