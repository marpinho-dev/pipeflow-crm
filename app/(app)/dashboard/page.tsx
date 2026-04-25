import { Header } from "@/components/shared/header"

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" description="Visão geral do seu pipeline de vendas" />
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total de Leads", value: "—" },
            { label: "Negócios Abertos", value: "—" },
            { label: "Valor do Pipeline", value: "—" },
            { label: "Taxa de Conversão", value: "—" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
