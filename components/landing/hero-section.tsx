import Link from "next/link"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Navbar */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-5">
        <span className="text-xl font-bold text-primary">MARP</span>
        <div className="flex items-center gap-2 sm:gap-6">
          <Link href="#features" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground">
            Funcionalidades
          </Link>
          <Link href="#pricing" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground">
            Preços
          </Link>
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-md border border-border px-3 sm:px-4 py-1.5 text-sm text-foreground hover:bg-accent"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-primary px-3 sm:px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <span className="hidden sm:inline">Comece grátis</span>
            <span className="sm:hidden">Cadastrar</span>
          </Link>
        </div>
      </nav>

      {/* Hero content */}
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 text-center">
        <div className="mx-auto mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Plano gratuito para sempre · Sem cartão de crédito
        </div>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight text-foreground">
          O CRM simples que seu time de vendas vai{" "}
          <span className="text-primary">realmente usar</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Pipeline Kanban, gestão de leads, histórico de interações e métricas de
          vendas — tudo num só lugar. Sem complexidade, sem custo absurdo.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Comece grátis agora
          </Link>
          <Link
            href="#features"
            className="rounded-md px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Ver funcionalidades →
          </Link>
        </div>

        {/* Mock screenshot */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-xl border border-border bg-muted shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-border bg-muted px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-4 rounded bg-background px-16 py-0.5 text-xs text-muted-foreground">
                app.pipeflow.com.br/pipeline
              </span>
            </div>
            <div className="grid grid-cols-6 gap-3 p-6">
              {["Novo Lead", "Contato", "Proposta", "Negociação", "Ganho", "Perdido"].map(
                (stage, i) => (
                  <div key={stage} className="rounded-lg bg-background p-3 shadow-sm">
                    <p className="mb-3 text-xs font-semibold text-muted-foreground">{stage}</p>
                    {Array.from({ length: i < 3 ? 3 - Math.floor(i / 2) : 1 }).map((_, j) => (
                      <div
                        key={j}
                        className="mb-2 rounded-md border border-border bg-muted p-2"
                      >
                        <div className="mb-1.5 h-2 w-3/4 rounded bg-muted-foreground/20" />
                        <div className="h-2 w-1/2 rounded bg-muted-foreground/10" />
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background" />
        </div>
      </div>
    </section>
  )
}
