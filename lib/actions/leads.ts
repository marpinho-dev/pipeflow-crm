"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE, FREE_PLAN_LIMIT } from "@/lib/constants"
import type { LeadFormData } from "@/types"

export async function createLeadAction(data: LeadFormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return { error: "Nenhum workspace selecionado" }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("plan")
    .eq("id", workspaceId)
    .single()

  if (workspace?.plan === "free") {
    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)

    if ((count ?? 0) >= FREE_PLAN_LIMIT) {
      return { error: `Limite de ${FREE_PLAN_LIMIT} leads atingido no plano Free. Faça upgrade para o plano Pro.` }
    }
  }

  const { error } = await supabase.from("leads").insert({
    workspace_id: workspaceId,
    owner_id: data.owner_id,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    company: data.company || null,
    role: data.role || null,
    status: data.status,
  })

  if (error) return { error: error.message }

  revalidatePath("/leads")
  return { success: true }
}

export async function updateLeadAction(leadId: string, data: LeadFormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("leads")
    .update({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      role: data.role || null,
      status: data.status,
      owner_id: data.owner_id,
    })
    .eq("id", leadId)

  if (error) return { error: error.message }

  revalidatePath("/leads")
  return { success: true }
}

export async function deleteLeadAction(leadId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase.from("leads").delete().eq("id", leadId)

  if (error) return { error: error.message }

  revalidatePath("/leads")
  return { success: true }
}
