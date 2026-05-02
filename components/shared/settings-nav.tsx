"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const SETTINGS_NAV = [
  { href: "/settings/workspace", label: "Workspace" },
  { href: "/settings/members", label: "Membros" },
]

export function SettingsNav() {
  const pathname = usePathname()
  return (
    <nav className="flex gap-1 md:flex-col md:space-y-1">
      {SETTINGS_NAV.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
