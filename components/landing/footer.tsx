import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <span className="text-lg font-bold text-primary">MARP</span>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground">
              Funcionalidades
            </Link>
            <Link href="#pricing" className="hover:text-foreground">
              Preços
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Entrar
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Cadastrar
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <span suppressHydrationWarning>© {new Date().getFullYear()} MARP CRM. Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  )
}
