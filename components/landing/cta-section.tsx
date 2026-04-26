import Link from "next/link"

export function CtaSection() {
  return (
    <section className="bg-blue-600 py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold text-white">
          Pronto para organizar suas vendas?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-blue-100">
          Crie sua conta gratuitamente em menos de 1 minuto. Sem cartão de crédito, sem
          burocracia.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-blue-400 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </section>
  )
}
