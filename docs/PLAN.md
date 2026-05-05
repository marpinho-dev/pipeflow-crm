# PipeFlow CRM — Plano de Execução

> Estratégia: **interface primeiro, backend depois**. Cada milestone entrega um incremento funcional e visível. O backend (Supabase, RLS, Stripe) é conectado progressivamente conforme a UI fica estável.

---

## M1 — Fundação & Design System

**Branch:** `feat/setup`

**Objetivo:** Projeto rodando localmente com estrutura de pastas, design system configurado e shell visual da aplicação (sem dados reais).

### Entregas

- [x] Inicializar projeto Next.js 14 com App Router e TypeScript 5
- [x] Configurar Tailwind CSS + shadcn/ui (tema, tokens de cor, tipografia)
- [x] Criar estrutura de pastas: `app/`, `components/`, `lib/`, `hooks/`, `types/`, `supabase/`
- [x] Implementar layout shell: Sidebar fixa + Header + área de conteúdo
- [x] Criar componente `WorkspaceSwitcher` (dropdown na sidebar, dados mockados)
- [x] Definir tipos TypeScript globais: `Workspace`, `Lead`, `Deal`, `Activity`, `User`
- [x] Configurar `eslint`, `prettier` e `tsconfig.json` strict
- [x] README com instruções de setup local

**Commit final:** `feat: project setup with Next.js 14, shadcn/ui and app shell`  
**Status:** ✅ Concluído — merged em `main`

---

## M2 — Landing Page

**Branch:** `feat/landing-page`

**Objetivo:** Página pública de apresentação do PipeFlow CRM, com todas as seções e CTA funcional para cadastro.

### Entregas

- [x] Seção Hero: título, subtítulo, CTA "Comece grátis" e imagem/mockup do produto
- [x] Seção Funcionalidades: cards com ícones para Kanban, Leads, Dashboard, Multi-empresa
- [x] Seção Planos e Preços: tabela Free vs Pro com lista de features e botão de upgrade
- [x] Seção CTA final: chamada para ação com formulário de e-mail ou botão de cadastro
- [x] Footer: links e copyright
- [x] Página responsiva (mobile + desktop)
- [x] Rota pública `/` sem autenticação

**Commit final:** `feat: landing page with hero, features, pricing and CTA sections`  
**Status:** ✅ Concluído — branch `feat/landing-page` (pendente merge em `main`)

---

## M3 — Autenticação (UI + Supabase Auth)

**Branch:** `feat/auth`

**Objetivo:** Fluxo completo de login, cadastro e recuperação de senha funcionando com Supabase Auth.

### Entregas

- [x] Configurar projeto Supabase e variáveis de ambiente (`.env.local`)
- [x] Instalar e configurar Supabase client (browser) e server (SSR)
- [x] Configurar middleware Next.js para proteção de rotas autenticadas
- [x] Página `/login`: formulário e-mail + senha, link para cadastro
- [x] Página `/signup`: formulário de cadastro com nome, e-mail e senha
- [x] Página `/forgot-password`: solicitação de reset de senha
- [x] Callback de autenticação (`/auth/callback`) para magic links e OAuth
- [x] Redirect automático: usuário autenticado → `/dashboard`, não autenticado → `/login`
- [x] Hook `useUser()` para acesso ao usuário logado em Client Components

**Commit final:** `feat: authentication flow with Supabase Auth, login and signup pages`  
**Status:** ✅ Concluído — branch `feat/auth` (pendente credenciais Supabase em `.env.local`)

---

## M4 — Workspaces & Multi-empresa

**Branch:** `feat/workspaces`

**Objetivo:** Usuário pode criar workspaces, convidar membros por e-mail e alternar entre workspaces.

### Entregas

- [x] Migration SQL: tabelas `workspaces`, `workspace_members`, `invites`, `profiles` com RLS
- [x] Fluxo de onboarding pós-cadastro: criar ou entrar em workspace
- [x] Página `/settings/workspace`: nome e plano atual do workspace
- [x] Página `/settings/members`: listar membros, papéis (Admin/Member) e botão de convite
- [x] Modal de convite: campo e-mail + papel, envio via Resend (graceful se sem API key)
- [x] Rota de aceite de convite: `/invite/[token]`
- [x] WorkspaceSwitcher conectado ao banco (listar workspaces do usuário)
- [x] Contexto de workspace ativo persistido em cookie (para SSR)
- [x] Política RLS: todos os dados filtrados por `workspace_id` do usuário

**Commit final:** `feat: workspace management, member invites and workspace switcher`  
**Status:** ✅ Concluído — branch `feat/workspaces`

---

## M5 — Gestão de Leads

**Branch:** `feat/leads`

**Objetivo:** CRUD completo de leads com listagem, busca, filtros e página de detalhe.

### Entregas

- [x] Migration SQL: tabela `leads` (nome, e-mail, telefone, empresa, cargo, status, workspace_id, owner_id)
- [x] Página `/leads`: listagem em tabela com paginação
- [x] Busca por nome/e-mail/empresa (debounced, server-side via URL params)
- [x] Filtros: por status e responsável
- [x] Modal "Novo Lead": formulário com todos os campos e validação
- [x] Modal de edição de lead (mesmo formulário)
- [x] Confirmação de exclusão de lead
- [x] Controle de limite do plano Free (máx. 50 leads): bloquear criação com aviso
- [x] Indicador de plano na UI quando limite estiver próximo (≥ 80%)

**Commit final:** `feat: leads management with full CRUD, search, filters and plan limits`  
**Status:** ✅ Concluído — branch `feat/leads`

---

## M6 — Pipeline Kanban

**Branch:** `feat/pipeline`

**Objetivo:** Board Kanban com drag-and-drop entre etapas, persistência no banco e cards de negócios.

### Entregas

- [x] Migration SQL: tabela `deals` (título, valor, etapa, lead_id, owner_id, prazo, workspace_id)
- [x] Página `/pipeline`: board com 6 colunas (etapas fixas)
- [x] Card de negócio: título, valor (R$), lead vinculado, responsável, prazo
- [x] Drag-and-drop com `@dnd-kit` (DndContext + DragOverlay por coluna)
- [x] Persistência imediata ao soltar card (Server Action + rollback otimista)
- [x] Modal "Novo Negócio": título, valor, lead (select), prazo, responsável
- [x] Drawer de detalhe do negócio: edição via clique no card (modal de edição)
- [x] Exclusão de negócio com confirmação (botão no hover do card)
- [x] Filtro de responsável no topo do board

**Commit final:** `feat: kanban pipeline with drag-and-drop, deal CRUD and stage persistence`  
**Status:** ✅ Concluído — branch `feat/leads`

---

## M7 — Detalhe do Lead & Timeline de Atividades

**Branch:** `feat/lead-detail`

**Objetivo:** Página de detalhe do lead com perfil completo, negócios vinculados e timeline cronológica de atividades.

### Entregas

- [x] Migration SQL: tabela `activities` (tipo, descrição, autor_id, lead_id, data, workspace_id)
- [x] Página `/leads/[id]`: layout em duas colunas (perfil + timeline)
- [x] Painel esquerdo: dados completos do lead e botão de edição
- [x] Lista de negócios vinculados ao lead com status e valor
- [x] Timeline de atividades em ordem cronológica decrescente
- [x] Formulário inline de nova atividade: tipo (ligação, e-mail, reunião, nota), descrição e data
- [x] Ícones distintos por tipo de atividade
- [x] Edição e exclusão de atividade

**Commit final:** `feat: lead detail page with profile, linked deals and activity timeline`  
**Status:** ✅ Concluído — branch `feat/lead-detail`

---

## M8 — Dashboard de Métricas

**Branch:** `feat/dashboard`

**Objetivo:** Dashboard com KPIs do workspace e gráfico de funil de vendas.

### Entregas

- [x] Página `/dashboard`: grid de cards + gráfico + lista de deals próximos do prazo
- [x] Card: Total de Leads (no workspace)
- [x] Card: Negócios Abertos (excluindo Fechado Ganho/Perdido)
- [x] Card: Valor Total do Pipeline (soma dos deals abertos)
- [x] Card: Taxa de Conversão (Fechado Ganho / total de deals × 100%)
- [x] Gráfico de funil com Recharts (contagem de deals por etapa)
- [x] Lista "Negócios com prazo próximo" (próximos 14 dias)
- [x] Queries otimizadas no servidor (Server Components, sem client fetch)
- [x] Estado vazio amigável para workspaces sem dados

**Commit final:** `feat: dashboard with KPI cards, funnel chart and upcoming deals`  
**Status:** ✅ Concluído — branch `feat/leads` (antecipado junto ao M6)

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

## M12 — Gestão de Atividades

**Branch:** `feat/activities`

**Objetivo:** Página dedicada para gerenciar todas as atividades do workspace: visualizar tarefas do dia, da semana, atrasadas e o histórico completo, com controle de conclusão e criação rápida sem sair da página.

### Entregas

- [ ] Migration SQL: adicionar coluna `completed` (boolean, default false) e `completed_at` (timestamptz) na tabela `activities`
- [ ] Página `/activities`: layout com cards de resumo no topo + lista filtrada
- [ ] Cards de resumo: contagem de atividades Atrasadas, Hoje e Esta Semana (clicáveis, filtram a lista)
- [ ] Abas / filtro de período: **Atrasadas** · **Hoje** · **Esta semana** · **Todas**
- [ ] Cada item da lista exibe: ícone de tipo, descrição, lead vinculado (link), responsável, data/hora agendada
- [ ] Botão "Concluir" por atividade: marca `completed = true` e `completed_at = now()` via Server Action
- [ ] Atividades concluídas ficam com estilo riscado/esmaecido; toggle para exibir/ocultar concluídas
- [ ] Filtros: por tipo (ligação, e-mail, reunião, nota) e por responsável
- [ ] Modal "Nova atividade": criar direto da página com seleção de lead (dropdown buscável)
- [ ] Badge na sidebar com contagem de atividades atrasadas + do dia (some quando zerado)
- [ ] Revalidar `/activities` e `/leads/[id]` após criar/concluir/excluir atividade

**Commit final:** `feat: activities management page with daily, weekly and overdue views`

---

## M13 — Fluxo de Pagamentos

**Branch:** `feat/customer-management`

**Objetivo:** Módulo de controle financeiro por cliente: cadastro de valor do projeto e parcelas no lead, e página dedicada com gráficos de projeção futura, histórico de pagamentos e quadro de valores travados.

### Regra de visibilidade

- Leads com deal em `novo_cliente` ou `apresentar_proposta` → valor **travado** (não entra no fluxo ativo)
- Leads com deal em `proposta_aceita` ou posterior → entram no **fluxo real de pagamentos**
- `overdue` é computado em tempo de consulta: `status = 'pending' AND due_date < hoje` (não armazenado)

### Entregas

- [ ] **Passo 1 — Corrigir `types/index.ts`:** atualizar `DealStage` para os 7 stages reais do banco; adicionar `InstallmentStatus`, `PaymentInstallment`, `InstallmentInput`; adicionar `project_value` e `installments_count` na interface `Lead`
- [ ] **Passo 2 — Migration `008_payment_installments.sql`:** adicionar `project_value` e `installments_count` na tabela `leads`; criar tabela `payment_installments` (id, workspace_id, lead_id, installment_number, amount, due_date, status, paid_at, timestamps); trigger `updated_at`; políticas RLS com `get_user_workspace_ids()`
- [ ] **Passo 3 — Formulário do Lead:** adicionar seção "Pagamentos do Projeto" no `lead-modal.tsx` com campo Valor do Projeto, Nº de Parcelas e N linhas dinâmicas (data + valor, default = total ÷ N, editável); atualizar `createLeadAction` e `updateLeadAction` em `lib/actions/leads.ts` para criar/substituir installments junto ao lead
- [ ] **Passo 4 — Sidebar:** adicionar item "Fluxo de Pagamento" com ícone `WalletCards` (lucide-react) em `components/shared/sidebar.tsx`, logo após Leads
- [ ] **Passo 5 — Server Actions `lib/actions/payments.ts`:** `markInstallmentAsPaid(installmentId)`; `getPaymentsPageData(workspaceId, month, year)` retornando projeção futura (12 meses, só pending), lista do mês (pending + overdue), histórico pago (12 meses), atrasados gerais e quadro de travados
- [ ] **Passo 6 — Página `/payments`:** `page.tsx` (Server Component) + `payments-client.tsx` (Client Component) com: seletor de mês, gráfico de projeção pendente (~65% largura), lista do mês com botão "Marcar como Pago" (~35%), gráfico de histórico com toggle Pagos/Atrasados (fullwidth), card de valores travados no rodapé

### Layout da página

```
[Seletor de mês: < Maio 2026 >]

[Gráfico barras — Projeção Pendente (~65%)] | [Lista do mês (~35%)]
 Próximos 12 meses, só pending               Pending + overdue do mês
                                              Botão "Marcar como Pago" por item

[Gráfico barras — Histórico (full width)]
 Últimos 12 meses | toggle: [Pagos] / [Atrasados]

[Card Travados]
 Valor potencial: R$ X.XXX,00 | Clientes em negociação: N
```

**Commit final:** `feat: payment flow module with installment tracking and cash flow dashboard`

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
| `feat/activities` | M12 — Gestão de Atividades |
| `feat/customer-management` | M13 — Fluxo de Pagamentos |
