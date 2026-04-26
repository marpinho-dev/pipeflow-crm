import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "Grátis",
    description: "Para freelancers e times pequenos começando a organizar vendas.",
    cta: "Criar conta grátis",
    href: "/signup",
    highlight: false,
    features: [
      "Até 2 colaboradores",
      "Até 50 leads",
      "Pipeline Kanban completo",
      "Timeline de atividades",
      "1 workspace",
    ],
    missing: ["Dashboard de métricas", "Múltiplos workspaces", "Suporte prioritário"],
  },
  {
    name: "Pro",
    price: "R$49",
    period: "/mês",
    description: "Para times em crescimento que precisam de escala e visibilidade total.",
    cta: "Começar com Pro",
    href: "/signup?plan=pro",
    highlight: true,
    features: [
      "Colaboradores ilimitados",
      "Leads ilimitados",
      "Pipeline Kanban completo",
      "Timeline de atividades",
      "Workspaces ilimitados",
      "Dashboard de métricas",
      "Suporte prioritário",
    ],
    missing: [],
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Preços</p>
          <h2 className="mt-2 text-3xl font-bold text-foreground">
            Simples e transparente
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Comece de graça e faça upgrade quando precisar de mais.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-8 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 ${
                plan.highlight
                  ? "bg-primary text-primary-foreground shadow-xl ring-2 ring-primary"
                  : "bg-card text-card-foreground shadow-sm ring-1 ring-border"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary/80 px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  Mais popular
                </span>
              )}

              <p className={`text-sm font-semibold ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {plan.name}
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className={`text-sm ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p className={`mt-3 text-sm leading-relaxed ${plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {plan.description}
              </p>

              <Link
                href={plan.href}
                className={`mt-8 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-background text-primary hover:opacity-90"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className={plan.highlight ? "text-primary-foreground/70" : "text-primary"}>✓</span>
                    {f}
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm opacity-40`}>
                    <span>✕</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
