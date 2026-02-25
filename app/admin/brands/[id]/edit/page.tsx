import { notFound } from "next/navigation"
import { BrandForm } from "@/components/BrandForm"
import { createServerSupabaseClient } from "@/src/shared/lib/supabase/server"
import { requireAdminUserOrRedirect } from "@/src/shared/lib/auth/require-admin"

type EditBrandPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditBrandPage({ params }: EditBrandPageProps) {
  const { id } = await params
  const brandId = Number(id)

  if (!Number.isInteger(brandId) || brandId <= 0) {
    notFound()
  }

  await requireAdminUserOrRedirect()
  const supabase = await createServerSupabaseClient()

  const { data: brand, error } = await supabase
    .from("brands")
    .select("id, name, slug, sort_order, is_active")
    .eq("id", brandId)
    .single()

  if (error || !brand) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <BrandForm mode="edit" brand={brand} />
    </div>
  )
}
