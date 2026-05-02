# PipeFlow CRM

CRM SaaS multi-empresa com pipeline Kanban, gestão de leads, registro de atividades e monetização via Stripe. Alternativa acessível ao HubSpot/Pipedrive para PMEs, freelancers e times de vendas.

---

## Índice

- [Visão Geral](#visão-geral)
- [Stack Técnica](#stack-técnica)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Modelo de Dados](#modelo-de-dados)
- [Etapas de Desenvolvimento](#etapas-de-desenvolvimento)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Planos e Limites](#planos-e-limites)
- [Papéis de Usuário](#papéis-de-usuário)

---

## Visão Geral

O **PipeFlow CRM** resolve um problema comum em pequenas empresas e times de vendas: leads gerenciados em planilhas, sem visão clara do funil, sem histórico de interações e sem controle de acesso por equipe. Ferramentas como HubSpot e Pipedrive existem, mas são caras ou complexas demais para quem está começando.

O PipeFlow oferece:
- Pipeline visual Kanban com drag-and-drop
- Cadastro completo de leads e negócios
- Histórico de atividades (ligações, e-mails, reuniões, notas)
- Multi-empresa com isolamento de dados por workspace
- Plano Free funcional e upgrade Pro via Stripe

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS v3 + shadcn/ui |
| Linguagem | TypeScript 5 (strict) |
| Banco + Auth | Supabase (PostgreSQL + RLS + Auth) |
| Pagamento | Stripe (Checkout + Webhooks + Customer Portal) |
| E-mail | Resend |
| Drag-and-drop | @dnd-kit/core + @dnd-kit/modifiers |
| Gráficos | Recharts |
| Temas | next-themes (dark/light mode) |
| Deploy | Vercel + Supabase |

---

## Funcionalidades

### Autenticação
- Cadastro e login via Supabase Auth (e-mail + senha)
- Sessão persistente com middleware Next.js
- Proteção de rotas no servidor

### Workspaces (Multi-empresa)
- Criar workspaces (cada empresa/projeto = 1 workspace)
- Convidar colaboradores por e-mail (Resend)
- Alternar entre workspaces via dropdown na sidebar
- Isolamento total de dados via Row Level Security (RLS)

### Leads
- Cadastro completo: nome, e-mail, telefone, empresa, cargo, status
- Listagem com busca textual e filtros (status, responsável)
- Página de detalhe com perfil + negócios vinculados + timeline de atividades
- Limite de 50 leads no plano Free

### Pipeline Kanban
- 6 etapas fixas: Novo Lead → Contato Realizado → Proposta Enviada → Negociação → Fechado Ganho → Fechado Perdido
- Drag-and-drop entre colunas com persistência imediata no banco
- Cards com título, valor, lead vinculado, responsável e prazo
- CRUD completo de negócios (criar, editar, excluir)

### Atividades
- Tipos: Ligação, E-mail, Reunião, Nota
- Gestão centralizada em `/activities` com cards de resumo (atrasadas, hoje, esta semana)
- Filtros por período, tipo e responsável
- Marcar como concluída/reabrir com atualização otimista na UI
- Timeline cronológica na página de detalhe do lead
- Badge com contagem de atividades pendentes na sidebar

### Dashboard
- Cards de métricas: total de leads, negócios abertos, valor do pipeline, taxa de conversão
- Gráfico de funil de vendas (Recharts)
- Negócios do usuário com prazo próximo

### Onboarding
- Wizard de 4 etapas para novos usuários: criar workspace → convidar equipe → primeiro lead → primeiro negócio
- Todas as etapas opcionais (botão "Pular")
- Barra de progresso visual

### Configurações (Admin)
- Gerenciar nome do workspace
- Convidar, alterar papel e remover membros
- Gerenciar assinatura Stripe (Customer Portal)
- Acesso restrito a admins — membros são redirecionados automaticamente

### Planos e Pagamento
- Plano Free: até 2 colaboradores e 50 leads
- Plano Pro: ilimitado (R$49/mês via Stripe)
- Stripe Checkout para upgrade
- Webhook atualiza `workspaces.plan` automaticamente

---

## Estrutura do Projeto

```
/
├── app/
│   ├── (auth)/                 # Rotas públicas
│   │   ├── login/
│   │   └── signup/
│   ├── (app)/                  # Rotas protegidas (requer autenticação)
│   │   ├── layout.tsx          # Shell: sidebar + workspace provider + badge
│   │   ├── dashboard/          # Métricas e gráfico de funil
│   │   ├── activities/         # Gestão centralizada de atividades
│   │   ├── leads/
│   │   │   └── [id]/           # Página de detalhe do lead
│   │   ├── pipeline/           # Kanban board
│   │   └── settings/           # Configurações (admin only)
│   │       ├── layout.tsx      # Guard: redireciona members para /dashboard
│   │       ├── workspace/
│   │       ├── members/
│   │       └── billing/
│   ├── api/
│   │   ├── stripe/webhook/     # Webhook Stripe → atualiza plano
│   │   └── invites/            # Aceitar convite por token
│   ├── auth/callback/          # Callback OAuth Supabase
│   ├── invite/[token]/         # Página pública de aceite de convite
│   ├── onboarding/             # Wizard de onboarding (4 etapas)
│   └── page.tsx                # Landing page pública
│
├── components/
│   ├── ui/                     # Primitivos shadcn/ui
│   ├── kanban/                 # Board, Column, Card, DragOverlay
│   ├── leads/                  # LeadCard, LeadForm, ActivityTimeline
│   ├── dashboard/              # MetricCard, FunnelChart
│   └── shared/                 # Sidebar, WorkspaceSwitcher, ThemeToggle
│
├── lib/
│   ├── supabase/               # Client (browser), Server, Middleware
│   ├── stripe/                 # Stripe client e helpers
│   ├── resend/                 # Templates de e-mail (convite)
│   └── actions/                # Server Actions (leads, deals, workspace)
│
├── hooks/                      # Custom React hooks
├── types/index.ts              # Tipos TypeScript globais
├── supabase/
│   └── migrations/             # SQL migrations (ordem de aplicação abaixo)
└── public/
```

---

## Modelo de Dados

### Tabelas principais

```
workspaces
  id, name, slug, plan (free|pro), stripe_customer_id, stripe_subscription_id, created_at

workspace_members
  id, workspace_id → workspaces, user_id → auth.users, role (admin|member), created_at

profiles
  id → auth.users, email, name, avatar_url, created_at

leads
  id, workspace_id, owner_id → auth.users, name, email, phone, company, role,
  status (active|inactive|converted|lost), created_at, updated_at

deals
  id, workspace_id, lead_id → leads, owner_id → auth.users, title, value,
  stage (new_lead|contacted|proposal_sent|negotiation|closed_won|closed_lost),
  due_date, created_at, updated_at

activities
  id, workspace_id, lead_id → leads, author_id → auth.users,
  type (call|email|meeting|note), description, activity_date,
  completed, completed_at, created_at, updated_at

invites
  id, workspace_id, email, role, token (UUID único), accepted_at, created_at
```

### Segurança (RLS)

Todas as tabelas têm Row Level Security ativado. O acesso é sempre filtrado por `workspace_id` via a função `get_user_workspace_ids()`, que retorna os workspaces do usuário autenticado. Nenhum dado de um workspace vaza para outro.

### Ordem das migrations

| Arquivo | Conteúdo |
|---|---|
| `001_workspaces.sql` | workspaces, profiles, workspace_members, invites, funções RLS |
| `002_leads.sql` | tabela leads + RLS |
| `003_deals.sql` | tabela deals + RLS |
| `004_activities.sql` | tabela activities + RLS |
| `002_activities.sql` | ALTER TABLE: adiciona `completed` e `completed_at` |

> **Importante:** aplicar na ordem acima. O arquivo `002_activities.sql` deve ser aplicado por último pois altera a tabela criada pelo `004_activities.sql`.

---

## Etapas de Desenvolvimento

O projeto foi construído em milestones incrementais, cada um entregando uma funcionalidade completa e testável.

---

### M1 — Setup do Projeto

Configuração inicial completa da stack:
- Next.js 14 com App Router e TypeScript strict
- Tailwind CSS v3 + shadcn/ui (tokens de design: cores, border, ring)
- Dark/light mode com `next-themes`
- Supabase configurado (client browser + server + middleware de proteção de rotas)
- `.gitignore` ajustado

---

### M2 — Landing Page

Página pública em `/` com:
- Hero com headline e CTA para cadastro
- Seção de funcionalidades com ícones Lucide
- Seção de planos (Free vs Pro com tabela de comparação)
- CTA final e rodapé
- Totalmente responsiva e dark mode compatível

---

### M3 — Autenticação

Fluxo completo de autenticação com Supabase Auth:
- Páginas `/login` e `/signup` com formulários validados
- Middleware Next.js protege todas as rotas em `(app)/`
- Callback OAuth em `/auth/callback`
- Criação automática de perfil (`profiles`) via upsert no layout da app
- Redirect automático: usuário logado → dashboard, não logado → login

---

### M4 — Workspaces e Membros

Sistema multi-empresa completo:
- Criar workspace (via RPC `create_workspace` no Supabase + define cookie de sessão)
- `WorkspaceSwitcher` na sidebar — alterna workspace via cookie
- Convidar membros por e-mail (Resend) com link de aceite por token único
- Página `/invite/[token]` para aceitar convite
- Configurações de membros: alterar papel (admin/member) e remover

**Segurança:**
- Apenas admins podem convidar, alterar papéis e remover membros — validado no servidor
- Acesso a `/settings` bloqueado para membros (redirect para `/dashboard`)

---

### M5 — Gestão de Leads

CRUD completo de leads:
- Listagem com busca em tempo real (nome, empresa, e-mail)
- Filtros por status (ativo, inativo, convertido, perdido) e responsável
- Formulário de criação/edição com todos os campos
- Controle de limite: plano Free bloqueia criação após 50 leads
- Página de detalhe `/leads/[id]` com:
  - Perfil completo do lead
  - Negócios vinculados (cards com stage, valor, prazo)
  - Timeline de atividades cronológica

---

### M6 — Pipeline Kanban

Pipeline visual de vendas com drag-and-drop:
- 6 colunas fixas com etapas do funil de vendas
- Implementado com `@dnd-kit/core`:
  - Card original fica como ghost (opacidade reduzida) durante o arrasto
  - `DragOverlay` renderiza cópia visual que segue o cursor
  - `snapCenterToCursor` do `@dnd-kit/modifiers` alinha o card ao centro do cursor
  - Stage atualizado imediatamente no banco ao soltar o card
- CRUD de negócios via modal: título, valor estimado (R$), responsável e prazo
- Cards exibem: título, valor, lead vinculado, responsável, prazo

---

### M7 — Dashboard de Métricas

Visão executiva do funil de vendas:
- 4 cards de métricas: total de leads, negócios abertos, valor total do pipeline, taxa de conversão (%)
- Gráfico de funil de vendas por etapa com Recharts
- Lista de negócios do usuário logado com prazo próximo

---

### M8 — Controle de Acesso por Papel (RBAC)

Implementação completa de roles admin/member:
- `settings/layout.tsx` é um Server Component que busca o papel do usuário no banco e redireciona membros para `/dashboard`
- Sidebar filtra itens `adminOnly: true` — membros não veem "Configurações"
- Todas as Server Actions que executam operações sensíveis validam o papel no servidor antes de agir

---

### M9 — E-mail Transacional (Resend)

Envio de convite por e-mail ao adicionar membro:
- Template HTML e texto plain formatados
- Remetente: `onboarding@resend.dev` (para testes — verificar domínio próprio em produção)
- Log de erro e sucesso no servidor para debugging
- Link do convite direciona para `/invite/[token]`

> **Em produção:** verificar domínio próprio no painel do Resend e atualizar o campo `from` em `lib/actions/workspace.ts`.

---

### M10 — Onboarding

Wizard guiado para novos usuários (sem workspace criado):
- **Etapa 1:** Nome do workspace (obrigatório)
- **Etapa 2:** Convidar membro da equipe (opcional — botão "Pular")
- **Etapa 3:** Criar primeiro lead (opcional)
- **Etapa 4:** Criar primeiro negócio (opcional, vinculado ao lead criado na etapa anterior)
- Barra de progresso visual com ícones e checkmark em etapas concluídas
- Redirect automático para `/dashboard` ao finalizar ou pular

---

### M11 — Gestão de Atividades

Página centralizada de atividades em `/activities`:
- **Cards de resumo:** Atrasadas (vermelho), Hoje (âmbar), Esta semana (azul) — clicáveis para filtrar
- **Abas de período:** Atrasadas | Hoje | Esta semana | Todas
- **Filtros:** tipo (ligação/e-mail/reunião/nota) e responsável
- **Toggle** para mostrar/ocultar atividades concluídas
- **Ações por atividade:** Concluir / Reabrir com atualização otimista + Excluir
- **Modal "Nova atividade":** dropdown de leads com busca, seletor de tipo visual, textarea, datetime-local
- **Badge na sidebar:** contagem de atividades não concluídas com data ≤ hoje

---

## Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Conta no [Stripe](https://stripe.com) (opcional para desenvolvimento local)
- Conta no [Resend](https://resend.com) (opcional para desenvolvimento local)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/marpinho-dev/pipeflow-crm.git
cd pipeflow-crm

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Crie .env.local e preencha com as chaves (ver seção abaixo)

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Aplicar as migrations no Supabase

No painel do Supabase, acesse **SQL Editor** e execute os arquivos na seguinte ordem:

1. `supabase/migrations/001_workspaces.sql`
2. `supabase/migrations/002_leads.sql`
3. `supabase/migrations/003_deals.sql`
4. `supabase/migrations/004_activities.sql`
5. `supabase/migrations/002_activities.sql`

---

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# App
APP_URL=http://localhost:3000

# Stripe (necessário para billing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...

# Resend (necessário para envio de convites por e-mail)
RESEND_API_KEY=re_...
```

---

## Planos e Limites

| | Free | Pro |
|---|---|---|
| Colaboradores | até 2 | Ilimitado |
| Leads | até 50 | Ilimitado |
| Pipeline Kanban | Sim | Sim |
| Atividades | Sim | Sim |
| Dashboard | Sim | Sim |
| Preço | Grátis | R$49/mês |

Os limites são validados no servidor (Server Actions) antes de criar leads ou membros. O upgrade é feito via Stripe Checkout e o plano é atualizado automaticamente via webhook.

---

## Papéis de Usuário

| Permissão | Admin | Membro |
|---|---|---|
| Ver leads e negócios do workspace | Sim | Sim |
| Criar/editar/excluir leads e negócios | Sim | Sim |
| Registrar e gerenciar atividades | Sim | Sim |
| Acessar Configurações | Sim | Não |
| Convidar membros | Sim | Não |
| Alterar papéis | Sim | Não |
| Remover membros | Sim | Não |
| Gerenciar plano (Stripe) | Sim | Não |

---

## Documentação adicional

- [`docs/PRD.md`](docs/PRD.md) — requisitos completos do produto
