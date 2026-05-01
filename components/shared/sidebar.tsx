"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Kanban,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { WorkspaceSwitcher } from "./workspace-switcher"
import { ThemeToggle } from "./theme-toggle"
import { createClient } from "@/lib/supabase/client"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/activities", label: "Atividades", icon: CheckSquare },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/settings", label: "Configurações", icon: Settings },
]

function SidebarContent({
  onNavClick,
  hideHeader,
}: {
  onNavClick?: () => void
  hideHeader?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      {!hideHeader && (
        <div className="flex h-14 items-center border-b border-border px-4">
          <div className="relative inline-flex items-baseline">
            <span className="text-lg font-bold text-foreground">Pipe</span>
            <span className="text-lg font-bold text-primary">Flow</span>
            <div className="logo-flow-line" />
          </div>
          <span className="ml-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">CRM</span>
        </div>
      )}

      <div className="p-3">
        <WorkspaceSwitcher />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-gradient-to-r from-primary/15 to-transparent text-primary font-semibold"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border p-3 space-y-1">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen w-60 flex-col border-r border-border bg-background">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center">
          <div className="relative inline-flex items-baseline">
            <span className="text-lg font-bold text-foreground">Pipe</span>
            <span className="text-lg font-bold text-primary">Flow</span>
            <div className="logo-flow-line" />
          </div>
          <span className="ml-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">CRM</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 z-50 flex h-screen w-64 flex-col bg-background border-r border-border transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center">
            <div className="relative inline-flex items-baseline">
              <span className="text-lg font-bold text-foreground">Pipe</span>
              <span className="text-lg font-bold text-primary">Flow</span>
              <div className="logo-flow-line" />
            </div>
            <span className="ml-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">CRM</span>
          </div>
          <button
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <SidebarContent onNavClick={() => setMobileOpen(false)} hideHeader />
        </div>
      </aside>
    </>
  )
}
