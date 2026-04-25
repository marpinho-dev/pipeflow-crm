# PipeFlow CRM

CRM SaaS multi-empresa com pipeline Kanban, gestão de leads e monetização via Stripe.

## Stack

- **Next.js 14** (App Router) + **TypeScript 5**
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (PostgreSQL + RLS + Auth)
- **Stripe** (Checkout + Webhooks)
- **Resend** (e-mail transacional)
- Deploy: **Vercel** + **Supabase**

## Setup local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_PRICE_ID=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### 4. Lint e formatação

```bash
npm run lint
npm run format
```

## Estrutura de pastas

```
app/
  (auth)/       # Login, signup (rotas públicas)
  (app)/        # Dashboard, leads, pipeline (rotas protegidas)
  api/          # API Routes
components/
  ui/           # shadcn/ui primitives
  kanban/       # Board Kanban
  leads/        # Componentes de leads
  dashboard/    # Métricas e gráficos
  shared/       # Sidebar, Header, WorkspaceSwitcher
lib/            # Supabase, Stripe, Resend helpers
hooks/          # Custom React hooks
types/          # Tipos TypeScript globais
supabase/
  migrations/   # SQL migrations
  functions/    # Edge Functions
```

## Planos

| Plano | Colaboradores | Leads | Preço |
|---|---|---|---|
| Free | até 2 | até 50 | Grátis |
| Pro | ilimitado | ilimitado | R$49/mês |

## Documentação

- [PRD](docs/PRD.md) — requisitos do produto
- [Plano de execução](docs/PLAN.md) — milestones de desenvolvimento
