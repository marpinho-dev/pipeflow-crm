import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/shared/sidebar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH !== "true") {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
