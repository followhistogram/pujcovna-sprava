"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function login(formData: FormData) {
  const supabase = createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const remember = formData.get("remember") === "on"

  // Nastavení délky session podle checkbox "Zapamatovat si mě"
  const sessionDuration = remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 dní vs 1 den

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      // Nastavení délky session
      data: {
        remember_me: remember,
      },
    },
  })

  if (error) {
    redirect("/login?message=Nesprávné přihlašovací údaje")
  }

  // Nastavení cookie s odpovídající délkou platnosti
  if (remember) {
    // Pro dlouhodobé zapamatování nastavíme delší expiraci
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) {
      // Refresh token pro prodloužení session
      await supabase.auth.refreshSession()
    }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
