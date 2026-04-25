# PipeFlow CRM — Project Briefing

## Visão Geral

CRM SaaS multi-empresa com pipeline Kanban, gestão de leads, registro de atividades e monetização via Stripe. Alternativa acessível ao HubSpot/Pipedrive para PMEs, freelancers e times de vendas.

PRD completo em: `docs/PRD.md`

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS + shadcn/ui |
| Linguagem | TypeScript 5 |
| Banco + Auth | Supabase (PostgreSQL + RLS + Auth) |
| Pagamento | Stripe (Checkout + Webhooks + Customer Portal) |
| E-mail | Resend |
| Drag-and-drop | @dnd-kit |
| Gráficos | Recharts |
| Deploy | Vercel (frontend) + Supabase (backend/DB) |

---

## Estrutura de Pastas

```
/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Rotas públicas: login, signup
│   ├── (app)/                  # Rotas protegidas (dashboard, leads, pipeline)
│   │   ├── dashboard/
│   │   ├── leads/
│   │   │   └── [id]/
│   │   ├── pipeline/
│   │   ├── settings/
│   │   └── layout.tsx          # Shell com sidebar + workspace switcher
│   ├── api/                    # API Routes (server-side)
│   │   ├── stripe/
│   │   │   └── webhook/
│   │   └── invites/
│   └── layout.tsx              # Root layout
│
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── kanban/                 # Board, Column, Card, drag logic
│   ├── leads/                  # LeadCard, LeadForm, ActivityTimeline
│   ├── dashboard/              # MetricCard, FunnelChart
│   └── shared/                 # Sidebar, Header, WorkspaceSwitcher
│
├── lib/
│   ├── supabase/               # Client, server e middleware helpers
│   ├── stripe/                 # Stripe client e helpers
│   └── resend/                 # Templates e funções de e-mail
│
├── hooks/                      # Custom React hooks
├── types/                      # Tipos TypeScript globais
├── docs/
│   └── PRD.md                  # Product Requirements Document
├── supabase/
│   ├── migrations/             # SQL migrations
│   └── functions/              # Edge Functions (ex: stripe webhook handler)
└── public/
```

---

## Modelo de Dados (Supabase)

- **workspaces** — organização/empresa, plano (free/pro), stripe_customer_id
- **workspace_members** — relação usuário ↔ workspace, papel (admin/member)
- **leads** — contatos do CRM, vinculados ao workspace
- **deals** — negócios no pipeline, vinculados ao lead e responsável
- **activities** — timeline de interações (ligação, e-mail, reunião, nota)
- **invites** — convites pendentes por e-mail para workspace

Isolamento de dados via **Row Level Security (RLS)** no Supabase — todo acesso filtrado pelo workspace_id do usuário autenticado.

---

## Convenções de Código

- Sempre TypeScript estrito (`strict: true`)
- Server Components por padrão; `'use client'` apenas quando necessário (interatividade, hooks)
- Data fetching nos Server Components via Supabase server client
- Mutações via Server Actions ou API Routes
- Nomear arquivos: `kebab-case.tsx` para componentes, `camelCase.ts` para utilitários
- Estilização: Tailwind CSS + variáveis CSS do shadcn/ui; sem CSS modules
- Sem comentários óbvios; comentar apenas lógica não evidente (ex: workaround de RLS)

---

## Planos e Limites

| Plano | Colaboradores | Leads | Preço |
|---|---|---|---|
| Free | até 2 | até 50 | Grátis |
| Pro | ilimitado | ilimitado | R$49/mês |

Controle de limites feito no servidor antes de criar lead/membro. Upgrade via Stripe Checkout. Webhook do Stripe atualiza `workspaces.plan` via Supabase Edge Function.

---

## Pipeline Kanban

Etapas fixas (em ordem):
1. Novo Lead
2. Contato Realizado
3. Proposta Enviada
4. Negociação
5. Fechado Ganho
6. Fechado Perdido

Drag-and-drop com `@dnd-kit`. Persistência imediata no banco ao soltar o card.

---

## Papéis de Usuário

| Papel | Permissões |
|---|---|
| Admin | Tudo: leads, deals, activities, configurações, convites, plano |
| Member | Leads e deals do próprio workspace; sem acesso a configurações |

---

## Design / Visual

- Referências: HubSpot CRM (layout), Pipedrive (pipeline UX)
- Tom: profissional, limpo, direto — sem excesso de decoração
- Paleta: usar tokens do shadcn/ui (primary, muted, destructive, etc.)
- Sidebar fixa com workspace switcher no topo
- Mobile-friendly, mas foco desktop-first

---

## Milestones de Desenvolvimento

1. Setup do projeto (Next.js + Supabase + shadcn/ui)
2. Autenticação e fluxo de workspace (criar, convidar, alternar)
3. CRUD de Leads com listagem, busca e filtros
4. Pipeline Kanban com drag-and-drop
5. Página de detalhe do lead + timeline de atividades
6. Dashboard de métricas e gráfico de funil
7. Integração Stripe (planos, checkout, webhook, portal)
8. Landing page pública
9. Onboarding do usuário
10. Polish, testes e deploy
