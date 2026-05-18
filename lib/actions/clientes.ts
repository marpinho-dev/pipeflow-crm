"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WORKSPACE_COOKIE, FREE_PLAN_LIMIT } from "@/lib/constants"
import type { ClienteFormData } from "@/types"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateClienteData(data: ClienteFormData) {
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
  return null
}

export async function createClienteAction(data: ClienteFormData) {
  const validationError = validateClienteData(data)
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
      return { error: `Limite de ${FREE_PLAN_LIMIT} clientes atingido no plano Free. Faça upgrade para o plano Pro.` }
    }
  }

  const { data: newLead, error } = await supabase
    .from("leads")
    .insert({
      workspace_id: workspaceId,
      owner_id: data.owner_id,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      role: data.role || null,
      status: "active",
      project_value: data.project_value ?? null,
      installments_count: data.installments_count ?? null,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  if (newLead && data.installments && data.installments.length > 0) {
    await supabase.from("payment_installments").insert(
      data.installments.map((inst) => ({
        workspace_id: workspaceId,
        lead_id: newLead.id,
        installment_number: inst.installment_number,
        amount: inst.amount,
        due_date: inst.due_date,
      }))
    )
  }

  if (newLead) {
    await supabase.from("deals").insert({
      workspace_id: workspaceId,
      lead_id: newLead.id,
      owner_id: data.owner_id,
      title: data.name,
      value: data.project_value ?? 0,
      stage: data.initial_stage ?? "novo_cliente",
    })
  }

  revalidatePath("/clientes")
  revalidatePath("/pipeline")
  return { success: true }
}

export async function updateClienteAction(leadId: string, data: ClienteFormData) {
  const validationError = validateClienteData(data)
  if (validationError) return { error: validationError }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value
  if (!workspaceId) return { error: "Nenhum workspace selecionado" }

  const { error } = await supabase
    .from("leads")
    .update({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      role: data.role || null,
      owner_id: data.owner_id,
      project_value: data.project_value ?? null,
      installments_count: data.installments_count ?? null,
    })
    .eq("id", leadId)

  if (error) return { error: error.message }

  if (data.installments !== undefined) {
    await supabase.from("payment_installments").delete().eq("lead_id", leadId)
    if (data.installments.length > 0) {
      await supabase.from("payment_installments").insert(
        data.installments.map((inst) => ({
          workspace_id: workspaceId,
          lead_id: leadId,
          installment_number: inst.installment_number,
          amount: inst.amount,
          due_date: inst.due_date,
        }))
      )
    }
  }

  revalidatePath("/clientes")
  revalidatePath("/payments")
  return { success: true }
}

export async function getClienteInstallmentsAction(leadId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const { data, error } = await supabase
    .from("payment_installments")
    .select("installment_number, amount, due_date")
    .eq("lead_id", leadId)
    .order("installment_number", { ascending: true })

  if (error) return { error: error.message }
  return { data: data ?? [] }
}

export async function deleteClienteAction(leadId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase.from("leads").delete().eq("id", leadId)

  if (error) return { error: error.message }

  revalidatePath("/clientes")
  return { success: true }
}
