import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Navbar */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-xl font-bold text-blue-600">PipeFlow</span>
        <div className="flex items-center gap-6">
          <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900">
            Funcionalidades
          </Link>
          <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
            Preços
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Comece grátis
          </Link>
        </div>
      </nav>

      {/* Hero content */}
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 text-center">
        <div className="mx-auto mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Plano gratuito para sempre · Sem cartão de crédito
        </div>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight text-gray-900">
          O CRM simples que seu time de vendas vai{" "}
          <span className="text-blue-600">realmente usar</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-gray-500">
          Pipeline Kanban, gestão de leads, histórico de interações e métricas de
          vendas — tudo num só lugar. Sem complexidade, sem custo absurdo.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Comece grátis agora
          </Link>
          <Link
            href="#features"
            className="rounded-md px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Ver funcionalidades →
          </Link>
        </div>

        {/* Mock screenshot */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-gray-200 bg-gray-100 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-4 rounded bg-white px-16 py-0.5 text-xs text-gray-400">
                app.pipeflow.com.br/pipeline
              </span>
            </div>
            <div className="grid grid-cols-6 gap-3 p-6">
              {["Novo Lead", "Contato", "Proposta", "Negociação", "Ganho", "Perdido"].map(
                (stage, i) => (
                  <div key={stage} className="rounded-lg bg-white p-3 shadow-sm">
                    <p className="mb-3 text-xs font-semibold text-gray-500">{stage}</p>
                    {Array.from({ length: i < 3 ? 3 - Math.floor(i / 2) : 1 }).map((_, j) => (
                      <div
                        key={j}
                        className="mb-2 rounded-md border border-gray-100 bg-gray-50 p-2"
                      >
                        <div className="mb-1.5 h-2 w-3/4 rounded bg-gray-200" />
                        <div className="h-2 w-1/2 rounded bg-gray-100" />
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white" />
        </div>
      </div>
    </section>
  )
}
