import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Vytvoří server-side Supabase klienta.
 * - Není potřeba async/await, protože cookies() je synchronní.
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /** Vráti všechny cookies pro Supabase */
        getAll() {
          return cookieStore.getAll()
        },
        /** Nastaví všechny cookies – ošetří výjimku při volání ze Server Componentu */
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Při renderu v Server Componentu nelze cookies nastavit – lze ignorovat,
            // pokud session obnovuje middleware.
          }
        },
      },
    },
  )
}
