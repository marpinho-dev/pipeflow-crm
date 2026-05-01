"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { resend } from "@/lib/resend/client"
import { inviteEmailHtml, inviteEmailText } from "@/lib/resend/templates/invite-email"
import { WORKSPACE_COOKIE, APP_URL } from "@/lib/constants"

export async function createWorkspaceAction(name: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const slug = base + "-" + Math.random().toString(36).slice(2, 7)

  const { data, error } = await supabase.rpc("create_workspace", {
    p_name: name,
    p_slug: slug,
  })

  if (error) return { error: error.message }

  cookies().set(WORKSPACE_COOKIE, data.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return { workspace: data }
}

export async function switchWorkspaceAction(workspaceId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single()

  if (!membership) return { error: "Acesso negado" }

  cookies().set(WORKSPACE_COOKIE, workspaceId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return { success: true }
}

export async function updateWorkspaceAction(workspaceId: string, name: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const { error } = await supabase
    .from("workspaces")
    .update({ name })
    .eq("id", workspaceId)

  if (error) return { error: error.message }

  revalidatePath("/settings/workspace")
  return { success: true }
}

export async function inviteMemberAction(
  workspaceId: string,
  email: string,
  role: "admin" | "member"
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single()

  if (membership?.role !== "admin") {
    return { error: "Apenas administradores podem convidar membros" }
  }

  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .insert({ workspace_id: workspaceId, email, role })
    .select()
    .single()

  if (inviteError) return { error: inviteError.message }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", workspaceId)
    .single()

  const inviterName = user.user_metadata?.name ?? user.email ?? "Alguém"
  const inviteUrl = `${APP_URL}/invite/${invite.token}`

  if (resend && workspace) {
    await resend.emails.send({
      from: "PipeFlow CRM <noreply@pipeflowcrm.com>",
      to: email,
      subject: `Você foi convidado para ${workspace.name}`,
      html: inviteEmailHtml({ workspaceName: workspace.name, inviterName, role, inviteUrl }),
      text: inviteEmailText({ workspaceName: workspace.name, inviterName, role, inviteUrl }),
    })
  }

  revalidatePath("/settings/members")
  return { invite, inviteUrl }
}

export async function revokeInviteAction(inviteId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const { error } = await supabase.from("invites").delete().eq("id", inviteId)

  if (error) return { error: error.message }

  revalidatePath("/settings/members")
  return { success: true }
}

export async function updateMemberRoleAction(memberId: string, role: "admin" | "member") {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const { data: target } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("id", memberId)
    .single()

  if (!target) return { error: "Membro não encontrado" }

  const { data: myMembership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", target.workspace_id)
    .eq("user_id", user.id)
    .single()

  if (myMembership?.role !== "admin") return { error: "Apenas administradores podem alterar papéis" }

  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("id", memberId)

  if (error) return { error: error.message }

  revalidatePath("/settings/members")
  return { success: true }
}

export async function removeMemberAction(memberId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const { data: target } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("id", memberId)
    .single()

  if (!target) return { error: "Membro não encontrado" }

  const { data: myMembership } = await supabase
    .from("workspace_members")
    .select("role, id")
    .eq("workspace_id", target.workspace_id)
    .eq("user_id", user.id)
    .single()

  const isSelf = myMembership?.id === memberId
  if (!isSelf && myMembership?.role !== "admin") return { error: "Apenas administradores podem remover membros" }

  const { error } = await supabase.from("workspace_members").delete().eq("id", memberId)

  if (error) return { error: error.message }

  revalidatePath("/settings/members")
  return { success: true }
}

export async function acceptInviteAction(token: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Você precisa estar logado para aceitar o convite" }

  const { data, error } = await supabase.rpc("accept_workspace_invite", { p_token: token })

  if (error) return { error: error.message }
  if (data?.error) return { error: data.error as string }

  cookies().set(WORKSPACE_COOKIE, data.workspace_id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return { workspaceId: data.workspace_id as string }
}
