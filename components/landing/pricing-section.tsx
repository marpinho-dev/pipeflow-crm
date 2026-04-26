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
    <section id="pricing" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Preços</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Simples e transparente
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-500">
            Comece de graça e faça upgrade quando precisar de mais.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-8 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 ${
                plan.highlight
                  ? "bg-blue-600 text-white shadow-xl ring-2 ring-blue-600"
                  : "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-800 px-3 py-0.5 text-xs font-semibold text-white">
                  Mais popular
                </span>
              )}

              <p className={`text-sm font-semibold ${plan.highlight ? "text-blue-200" : "text-gray-500"}`}>
                {plan.name}
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className={`text-sm ${plan.highlight ? "text-blue-200" : "text-gray-400"}`}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p className={`mt-3 text-sm leading-relaxed ${plan.highlight ? "text-blue-100" : "text-gray-500"}`}>
                {plan.description}
              </p>

              <Link
                href={plan.href}
                className={`mt-8 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className={plan.highlight ? "text-blue-200" : "text-blue-600"}>✓</span>
                    {f}
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? "text-blue-300" : "text-gray-300"}`}>
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
