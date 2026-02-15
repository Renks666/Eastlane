import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Админ-панель</h1>
      <p className="mb-4">Вы вошли как: {user.email}</p>
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/admin/products">Управление товарами</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/categories">Управление категориями</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/orders">Заказы</Link>
        </Button>
      </div>
    </div>
  )
}
