import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase/config"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  const rawNext = searchParams.get("next") ?? "/dashboard"
  // Previne open redirect: valida que o destino pertence à mesma origem
  let next = "/dashboard"
  try {
    const resolved = new URL(rawNext, origin)
    if (resolved.origin === origin) next = resolved.pathname + resolved.search
  } catch {
    // rawNext inválido — mantém /dashboard
  }

  if (code) {
    const cookieStore = cookies()
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
