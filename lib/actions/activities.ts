"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE } from "@/lib/constants"
import type { ActivityType } from "@/types"

export type ActivityFormData = {
  type: ActivityType
  description: string
  activity_date: string
}

export async function createActivityAction(leadId: string, data: ActivityFormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return { error: "Workspace não encontrado" }

  const { error } = await supabase.from("activities").insert({
    workspace_id: workspaceId,
    lead_id: leadId,
    author_id: user.id,
    type: data.type,
    description: data.description,
    activity_date: data.activity_date,
  })

  if (error) return { error: error.message }

  revalidatePath(`/leads/${leadId}`)
  return { success: true }
}

export async function updateActivityAction(activityId: string, leadId: string, data: ActivityFormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("activities")
    .update({
      type: data.type,
      description: data.description,
      activity_date: data.activity_date,
    })
    .eq("id", activityId)

  if (error) return { error: error.message }

  revalidatePath(`/leads/${leadId}`)
  return { success: true }
}

export async function deleteActivityAction(activityId: string, leadId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase.from("activities").delete().eq("id", activityId)

  if (error) return { error: error.message }

  revalidatePath(`/leads/${leadId}`)
  return { success: true }
}
