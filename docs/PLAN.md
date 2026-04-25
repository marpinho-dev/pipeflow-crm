# PipeFlow CRM — Plano de Execução

> Estratégia: **interface primeiro, backend depois**. Cada milestone entrega um incremento funcional e visível. O backend (Supabase, RLS, Stripe) é conectado progressivamente conforme a UI fica estável.

---

## M1 — Fundação & Design System

**Branch:** `feat/setup`

**Objetivo:** Projeto rodando localmente com estrutura de pastas, design system configurado e shell visual da aplicação (sem dados reais).

### Entregas

- [ ] Inicializar projeto Next.js 14 com App Router e TypeScript 5
- [ ] Configurar Tailwind CSS + shadcn/ui (tema, tokens de cor, tipografia)
- [ ] Criar estrutura de pastas: `app/`, `components/`, `lib/`, `hooks/`, `types/`, `supabase/`
- [ ] Implementar layout shell: Sidebar fixa + Header + área de conteúdo
- [ ] Criar componente `WorkspaceSwitcher` (dropdown na sidebar, dados mockados)
- [ ] Definir tipos TypeScript globais: `Workspace`, `Lead`, `Deal`, `Activity`, `User`
- [ ] Configurar `eslint`, `prettier` e `tsconfig.json` strict
- [ ] README com instruções de setup local

**Commit final:** `feat: project setup with Next.js 14, shadcn/ui and app shell`

---

## M2 — Landing Page

**Branch:** `feat/landing-page`

**Objetivo:** Página pública de apresentação do PipeFlow CRM, com todas as seções e CTA funcional para cadastro.

### Entregas

- [ ] Seção Hero: título, subtítulo, CTA "Comece grátis" e imagem/mockup do produto
- [ ] Seção Funcionalidades: cards com ícones para Kanban, Leads, Dashboard, Multi-empresa
- [ ] Seção Planos e Preços: tabela Free vs Pro com lista de features e botão de upgrade
- [ ] Seção CTA final: chamada para ação com formulário de e-mail ou botão de cadastro
- [ ] Footer: links e copyright
- [ ] Página responsiva (mobile + desktop)
- [ ] Rota pública `/` sem autenticação

**Commit final:** `feat: landing page with hero, features, pricing and CTA sections`

---

## M3 — Autenticação (UI + Supabase Auth)

**Branch:** `feat/auth`

**Objetivo:** Fluxo completo de login, cadastro e recuperação de senha funcionando com Supabase Auth.

### Entregas

- [ ] Configurar projeto Supabase e variáveis de ambiente (`.env.local`)
- [ ] Instalar e configurar Supabase client (browser) e server (SSR)
- [ ] Configurar middleware Next.js para proteção de rotas autenticadas
- [ ] Página `/login`: formulário e-mail + senha, link para cadastro
- [ ] Página `/signup`: formulário de cadastro com nome, e-mail e senha
- [ ] Página `/forgot-password`: solicitação de reset de senha
- [ ] Callback de autenticação (`/auth/callback`) para magic links e OAuth
- [ ] Redirect automático: usuário autenticado → `/dashboard`, não autenticado → `/login`
- [ ] Hook `useUser()` para acesso ao usuário logado em Client Components

**Commit final:** `feat: authentication flow with Supabase Auth, login and signup pages`

---

## M4 — Workspaces & Multi-empresa

**Branch:** `feat/workspaces`

**Objetivo:** Usuário pode criar workspaces, convidar membros por e-mail e alternar entre workspaces.

### Entregas

- [ ] Migration SQL: tabelas `workspaces`, `workspace_members`, `invites` com RLS
- [ ] Fluxo de onboarding pós-cadastro: criar ou entrar em workspace
- [ ] Página `/settings/workspace`: nome, logo e plano atual do workspace
- [ ] Página `/settings/members`: listar membros, papéis (Admin/Member) e botão de convite
- [ ] Modal de convite: campo e-mail + papel, envio via Resend
- [ ] Rota de aceite de convite: `/invite/[token]`
- [ ] WorkspaceSwitcher conectado ao banco (listar workspaces do usuário)
- [ ] Contexto de workspace ativo persistido em cookie (para SSR)
- [ ] Política RLS: todos os dados filtrados por `workspace_id` do usuário

**Commit final:** `feat: workspace management, member invites and workspace switcher`

---

## M5 — Gestão de Leads

**Branch:** `feat/leads`

**Objetivo:** CRUD completo de leads com listagem, busca, filtros e página de detalhe.

### Entregas

- [ ] Migration SQL: tabela `leads` (nome, e-mail, telefone, empresa, cargo, status, workspace_id, owner_id)
- [ ] Página `/leads`: listagem em tabela com paginação
- [ ] Busca por nome/e-mail/empresa (debounced, server-side)
- [ ] Filtros: por status, responsável e data de criação
- [ ] Modal/drawer "Novo Lead": formulário com todos os campos e validação
- [ ] Drawer de edição de lead (reusa o mesmo formulário)
- [ ] Confirmação de exclusão de lead
- [ ] Controle de limite do plano Free (máx. 50 leads): bloquear criação com toast de aviso
- [ ] Indicador de plano na UI quando limite estiver próximo (≥ 80%)

**Commit final:** `feat: leads management with full CRUD, search, filters and plan limits`

---

## M6 — Pipeline Kanban

**Branch:** `feat/pipeline`

**Objetivo:** Board Kanban com drag-and-drop entre etapas, persistência no banco e cards de negócios.

### Entregas

- [ ] Migration SQL: tabela `deals` (título, valor, etapa, lead_id, owner_id, prazo, workspace_id)
- [ ] Página `/pipeline`: board com 6 colunas (etapas fixas)
- [ ] Card de negócio: título, valor (R$), lead vinculado, responsável, prazo
- [ ] Drag-and-drop com `@dnd-kit` (DndContext + SortableContext por coluna)
- [ ] Persistência imediata ao soltar card (Server Action ou API Route)
- [ ] Modal "Novo Negócio": título, valor, lead (select), prazo, responsável
- [ ] Drawer de detalhe do negócio: edição inline dos campos
- [ ] Exclusão de negócio com confirmação
- [ ] Filtro de responsável no topo do board

**Commit final:** `feat: kanban pipeline with drag-and-drop, deal CRUD and stage persistence`

---

## M7 — Detalhe do Lead & Timeline de Atividades

**Branch:** `feat/lead-detail`

**Objetivo:** Página de detalhe do lead com perfil completo, negócios vinculados e timeline cronológica de atividades.

### Entregas

- [ ] Migration SQL: tabela `activities` (tipo, descrição, autor_id, lead_id, data, workspace_id)
- [ ] Página `/leads/[id]`: layout em duas colunas (perfil + timeline)
- [ ] Painel esquerdo: dados completos do lead e botão de edição
- [ ] Lista de negócios vinculados ao lead com status e valor
- [ ] Timeline de atividades em ordem cronológica decrescente
- [ ] Formulário inline de nova atividade: tipo (ligação, e-mail, reunião, nota), descrição e data
- [ ] Ícones distintos por tipo de atividade
- [ ] Edição e exclusão de atividade

**Commit final:** `feat: lead detail page with profile, linked deals and activity timeline`

---

## M8 — Dashboard de Métricas

**Branch:** `feat/dashboard`

**Objetivo:** Dashboard com KPIs do workspace e gráfico de funil de vendas.

### Entregas

- [ ] Página `/dashboard`: grid de cards + gráfico + lista de deals próximos do prazo
- [ ] Card: Total de Leads (no workspace)
- [ ] Card: Negócios Abertos (excluindo Fechado Ganho/Perdido)
- [ ] Card: Valor Total do Pipeline (soma dos deals abertos)
- [ ] Card: Taxa de Conversão (Fechado Ganho / total de deals × 100%)
- [ ] Gráfico de funil com Recharts (contagem de deals por etapa)
- [ ] Lista "Negócios com prazo próximo" (próximos 7 dias, do usuário logado)
- [ ] Queries otimizadas no servidor (Server Components, sem client fetch)
- [ ] Estado vazio amigável para workspaces sem dados

**Commit final:** `feat: dashboard with KPI cards, funnel chart and upcoming deals`

---

## M9 — Monetização com Stripe

**Branch:** `feat/stripe`

**Objetivo:** Integração completa de pagamento: planos, checkout, webhook e portal do cliente.

### Entregas

- [ ] Configurar conta Stripe e variáveis de ambiente (chaves, price IDs)
- [ ] Migration SQL: adicionar `plan`, `stripe_customer_id`, `stripe_subscription_id` em `workspaces`
- [ ] Página `/settings/billing`: plano atual, uso (leads, membros), botão Upgrade/Manage
- [ ] Rota `/api/stripe/checkout`: criar sessão de checkout para o plano Pro
- [ ] Rota `/api/stripe/portal`: criar sessão do Customer Portal
- [ ] Supabase Edge Function `stripe-webhook`: processar eventos `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Bloquear criação de leads/membros além do limite do plano Free no servidor
- [ ] Banner de upgrade contextual quando limite atingido
- [ ] Testar com cartões de teste do Stripe

**Commit final:** `feat: Stripe integration with checkout, webhook and customer portal`

---

## M10 — Onboarding do Usuário

**Branch:** `feat/onboarding`

**Objetivo:** Fluxo guiado para novos usuários criarem workspace e adicionarem o primeiro lead/deal.

### Entregas

- [ ] Detectar primeiro acesso (sem workspace vinculado) após autenticação
- [ ] Passo 1: criar nome do workspace (empresa ou nome pessoal)
- [ ] Passo 2: convidar membros opcionalmente (pode pular)
- [ ] Passo 3: criar primeiro lead (guiado)
- [ ] Passo 4: criar primeiro negócio no pipeline (guiado)
- [ ] Barra de progresso visual entre os passos
- [ ] Opção "Pular onboarding" em qualquer etapa
- [ ] Redirect para `/dashboard` ao concluir

**Commit final:** `feat: guided onboarding flow for new users`

---

## M11 — Polish, Testes & Deploy

**Branch:** `feat/polish-deploy`

**Objetivo:** Aplicação estável, testada e publicada em produção no Vercel.

### Entregas

- [ ] Revisão de acessibilidade: foco de teclado, aria-labels, contraste
- [ ] Loading states e skeletons em todas as páginas de dados
- [ ] Error boundaries e páginas de erro (`error.tsx`, `not-found.tsx`)
- [ ] Toast de feedback para todas as ações CRUD
- [ ] Testes de fumaça nas rotas críticas (auth, leads, pipeline, billing)
- [ ] Verificar políticas RLS: isolamento entre workspaces
- [ ] Configurar variáveis de ambiente no Vercel e Supabase (produção)
- [ ] Deploy no Vercel conectado ao repositório GitHub
- [ ] Configurar domínio customizado (opcional)
- [ ] Smoke test pós-deploy: cadastro → workspace → lead → deal → upgrade

**Commit final:** `feat: production deploy with polish, error states and accessibility`

---

## Resumo de Branches

| Branch | Milestone |
|---|---|
| `feat/setup` | M1 — Fundação & Design System |
| `feat/landing-page` | M2 — Landing Page |
| `feat/auth` | M3 — Autenticação |
| `feat/workspaces` | M4 — Workspaces & Multi-empresa |
| `feat/leads` | M5 — Gestão de Leads |
| `feat/pipeline` | M6 — Pipeline Kanban |
| `feat/lead-detail` | M7 — Detalhe do Lead & Atividades |
| `feat/dashboard` | M8 — Dashboard de Métricas |
| `feat/stripe` | M9 — Monetização com Stripe |
| `feat/onboarding` | M10 — Onboarding |
| `feat/polish-deploy` | M11 — Polish & Deploy |
