import { SettingsNav } from "@/components/shared/settings-nav"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <aside className="hidden md:block w-48 shrink-0 border-r border-border p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Configurações
        </p>
        <SettingsNav />
      </aside>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
