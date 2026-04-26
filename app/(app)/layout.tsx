import { Sidebar } from "@/components/shared/sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
