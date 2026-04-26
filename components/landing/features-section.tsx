const features = [
  {
    icon: "⬜",
    title: "Pipeline Kanban",
    description:
      "Visualize negócios em cada etapa do funil. Arraste e solte cards entre colunas e persista as mudanças em tempo real.",
  },
  {
    icon: "👥",
    title: "Gestão de Leads",
    description:
      "Cadastre contatos com nome, empresa, e-mail e telefone. Busca rápida, filtros e exportação integrados.",
  },
  {
    icon: "📊",
    title: "Dashboard de Métricas",
    description:
      "Total de leads, negócios abertos, valor do pipeline e taxa de conversão num painel atualizado em tempo real.",
  },
  {
    icon: "🏢",
    title: "Multi-empresa",
    description:
      "Crie workspaces separados para cada empresa ou projeto. Convide colaboradores por e-mail com papéis distintos.",
  },
  {
    icon: "📋",
    title: "Timeline de Atividades",
    description:
      "Registre ligações, e-mails, reuniões e notas diretamente no perfil do lead. Histórico completo de interações.",
  },
  {
    icon: "🔒",
    title: "Isolamento por workspace",
    description:
      "Dados de cada empresa completamente separados via Row Level Security. Segurança no nível do banco de dados.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Funcionalidades
          </p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Tudo que você precisa para vender mais
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-500">
            Sem recursos que você nunca vai usar. Focado no que realmente move negócios.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl">
                {f.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
