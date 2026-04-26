import { createClient } from "@/lib/supabase/server"
import { InviteAcceptClient } from "./invite-accept-client"

interface InviteDetails {
  id: string
  email: string
  role: string
  workspace_id: string
  workspace_name: string
  workspace_plan: string
}

export default async function InvitePage({ params }: { params: { token: string } }) {
  const { token } = params
  const supabase = createClient()

  const { data: invite, error } = await supabase.rpc("get_invite_by_token", { p_token: token })

  if (error || !invite || invite.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-2xl">
            ⚠️
          </div>
          <h1 className="mb-2 text-xl font-semibold text-foreground">Convite inválido</h1>
          <p className="text-sm text-muted-foreground">
            {(invite as { error?: string } | null)?.error ?? "Este convite não existe ou já expirou."}
          </p>
        </div>
      </div>
    )
  }

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-primary">PipeFlow</span>
          <span className="text-2xl font-bold text-foreground">CRM</span>
        </div>
        <InviteAcceptClient
          token={token}
          invite={invite as InviteDetails}
          isAuthenticated={!!user}
          userEmail={user?.email ?? null}
        />
      </div>
    </div>
  )
}
