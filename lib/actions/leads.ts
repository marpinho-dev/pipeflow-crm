"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE, FREE_PLAN_LIMIT } from "@/lib/constants"
import type { LeadFormData } from "@/types"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_STATUSES = ["active", "inactive", "converted", "lost"] as const

function validateLeadData(data: LeadFormData) {
  if (!data.name || data.name.trim().length < 1 || data.name.length > 255) {
    return "Nome deve ter entre 1 e 255 caracteres"
  }
  if (data.email && (!EMAIL_REGEX.test(data.email) || data.email.length > 255)) {
    return "E-mail inválido"
  }
  if (data.phone && data.phone.length > 50) {
    return "Telefone muito longo"
  }
  if (data.company && data.company.length > 255) {
    return "Empresa deve ter no máximo 255 caracteres"
  }
  if (data.role && data.role.length > 255) {
    return "Cargo deve ter no máximo 255 caracteres"
  }
  if (!VALID_STATUSES.includes(data.status as typeof VALID_STATUSES[number])) {
    return "Status inválido"
  }
  return null
}

export async function createLeadAction(data: LeadFormData) {
  const validationError = validateLeadData(data)
  if (validationError) return { error: validationError }

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
  const validationError = validateLeadData(data)
  if (validationError) return { error: validationError }

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
