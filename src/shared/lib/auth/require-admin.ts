import type { User } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { isAdminUser } from "@/src/shared/lib/auth/admin"

export async function requireAdminUserOrRedirect(): Promise<User> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  if (!isAdminUser(user)) {
    redirect("/admin/login")
  }

  return user
}

export async function requireAdminUser() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Unauthorized.")
  }

  if (!isAdminUser(user)) {
    throw new Error("Forbidden.")
  }

  return { supabase, user }
}

