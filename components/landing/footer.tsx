import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <span className="text-lg font-bold text-blue-600">PipeFlow</span>

          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="#features" className="hover:text-gray-900">
              Funcionalidades
            </Link>
            <Link href="#pricing" className="hover:text-gray-900">
              Preços
            </Link>
            <Link href="/login" className="hover:text-gray-900">
              Entrar
            </Link>
            <Link href="/signup" className="hover:text-gray-900">
              Cadastrar
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} PipeFlow CRM. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
