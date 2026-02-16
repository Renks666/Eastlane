import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { isAdminUser } from "@/src/shared/lib/auth/admin"
import { createAdminClient } from "@/src/shared/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const adminSupabase = createAdminClient()

    const [{ data: latestRow, error: latestError }, { count: newOrdersCount, error: countError }] = await Promise.all([
      adminSupabase
        .from("orders")
        .select("created_at")
        .not("customer_name", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      adminSupabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "new")
        .not("customer_name", "is", null),
    ])

    if (latestError || countError) {
      throw new Error(latestError?.message || countError?.message || "Notification query failed")
    }

    return NextResponse.json({
      latestCreatedAt: latestRow?.created_at ?? null,
      newOrdersCount: newOrdersCount ?? 0,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
