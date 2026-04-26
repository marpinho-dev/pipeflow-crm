interface InviteEmailParams {
  workspaceName: string
  inviterName: string
  role: string
  inviteUrl: string
}

export function inviteEmailHtml({ workspaceName, inviterName, role, inviteUrl }: InviteEmailParams) {
  const roleLabel = role === "admin" ? "Administrador" : "Membro"
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Convite para ${workspaceName}</title>
  </head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:40px 0;">
    <div style="max-width:480px;margin:0 auto;background:white;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="margin-bottom:32px;">
        <span style="font-size:20px;font-weight:700;color:#6366f1;">PipeFlow</span>
        <span style="font-size:20px;font-weight:700;color:#111827;">CRM</span>
      </div>
      <h1 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 8px;">
        Você foi convidado para ${workspaceName}
      </h1>
      <p style="font-size:15px;color:#6b7280;margin:0 0 24px;">
        <strong>${inviterName}</strong> convidou você para entrar no workspace
        <strong>${workspaceName}</strong> como <strong>${roleLabel}</strong>.
      </p>
      <a href="${inviteUrl}"
        style="display:inline-block;background:#6366f1;color:white;font-size:15px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
        Aceitar convite
      </a>
      <p style="font-size:13px;color:#9ca3af;margin:24px 0 0;">
        Este convite expira em 7 dias. Se você não esperava este convite, pode ignorar este e-mail.
      </p>
    </div>
  </body>
</html>`
}

export function inviteEmailText({ workspaceName, inviterName, role, inviteUrl }: InviteEmailParams) {
  const roleLabel = role === "admin" ? "Administrador" : "Membro"
  return `Você foi convidado para ${workspaceName}

${inviterName} convidou você para entrar como ${roleLabel} no workspace ${workspaceName}.

Aceitar convite: ${inviteUrl}

Este convite expira em 7 dias.`
}
