import Link from "next/link"

export function CtaSection() {
  return (
    <section className="bg-primary py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold text-primary-foreground">
          Pronto para organizar suas vendas?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">
          Crie sua conta gratuitamente em menos de 1 minuto. Sem cartão de crédito, sem
          burocracia.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-background px-6 py-3 text-sm font-semibold text-primary shadow-sm hover:opacity-90"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-primary-foreground/30 px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </section>
  )
}
