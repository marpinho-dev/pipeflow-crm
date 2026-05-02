"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE } from "@/lib/constants"

export async function createOnboardingLeadAction(name: string, company: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return { error: "Workspace não encontrado" }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      workspace_id: workspaceId,
      owner_id: user.id,
      name: name.trim(),
      company: company.trim() || null,
      status: "active",
    })
    .select("id")
    .single()

  if (error) return { error: error.message }
  return { leadId: data.id as string }
}

export async function createOnboardingDealAction(
  title: string,
  value: number,
  leadId: string | null
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return { error: "Workspace não encontrado" }

  const { error } = await supabase.from("deals").insert({
    workspace_id: workspaceId,
    owner_id: user.id,
    title: title.trim(),
    value: value || 0,
    stage: "new_lead",
    lead_id: leadId || null,
  })

  if (error) return { error: error.message }
  return {}
}
