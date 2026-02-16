import type { User } from "@supabase/supabase-js"

function parseAdminEmails(raw: string | undefined) {
  if (!raw) return []
  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminUser(user: User) {
  const roleFromAppMetadata = user.app_metadata?.role
  const roleFromUserMetadata = user.user_metadata?.role
  if (roleFromAppMetadata === "admin" || roleFromUserMetadata === "admin") {
    return true
  }

  const adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS)
  if (adminEmails.length > 0) {
    const email = user.email?.toLowerCase()
    return Boolean(email && adminEmails.includes(email))
  }

  // Backward-compatible fallback: if explicit admin rules are not configured,
  // authenticated users can still access current admin area.
  return true
}

