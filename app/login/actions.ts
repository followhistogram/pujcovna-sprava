"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signIn(prevState: { error: string } | null, formData: FormData) {
  const supabase = createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "Nesprávné přihlašovací údaje." }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
