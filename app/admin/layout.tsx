import type { ReactNode } from "react"
import { AdminLayoutShell } from "@/src/shared/ui/admin/admin-layout-shell"

type AdminLayoutProps = {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>
}
