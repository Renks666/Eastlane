import Link from "next/link"
import { redirect } from "next/navigation"
import { CategoryDeleteButton } from "@/app/admin/categories/CategoryDeleteButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

type CategoryRow = {
  id: number
  name: string
  slug: string
}

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true })

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-600">Failed to load categories: {error.message}</p>
      </div>
    )
  }

  const categories = (data ?? []) as CategoryRow[]

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage product categories.</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">Create category</Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No categories yet. Create your first category.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 border-b px-4 py-3 text-sm font-medium">
              <span>Name</span>
              <span>Slug</span>
              <span className="text-right">Actions</span>
            </div>

            {categories.map((category) => (
              <div
                key={category.id}
                className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 border-b px-4 py-3 last:border-b-0"
              >
                <span className="font-medium">{category.name}</span>
                <span className="text-sm text-muted-foreground">{category.slug}</span>
                <div className="flex justify-end gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/categories/${category.id}/edit`}>Edit</Link>
                  </Button>
                  <CategoryDeleteButton categoryId={category.id} categoryName={category.name} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
