"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react"
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  ShoppingCart,
  Shapes,
} from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type AdminLayoutShellProps = {
  children: ReactNode
}

type NavItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

type OrderNotificationResponse = {
  latestCreatedAt: string | null
  newOrdersCount: number
}

const LAST_SEEN_ORDER_KEY = "eastlane.admin.notifications.lastSeenOrderCreatedAt"

const navItems: NavItem[] = [
  { title: "Обзор", href: "/admin", icon: LayoutDashboard },
  { title: "Товары", href: "/admin/products", icon: Package },
  { title: "Категории", href: "/admin/categories", icon: Shapes },
  { title: "Заказы", href: "/admin/orders", icon: ShoppingCart },
]

function resolveTitle(pathname: string) {
  if (pathname.startsWith("/admin/orders")) return "Заказы"
  if (pathname.startsWith("/admin/products")) return "Товары"
  if (pathname.startsWith("/admin/categories")) return "Категории"
  return "Обзор"
}

function resolveSearchRoute(pathname: string) {
  if (pathname.startsWith("/admin/products")) return "/admin/products"
  if (pathname.startsWith("/admin/categories")) return "/admin/categories"
  if (pathname.startsWith("/admin/orders")) return "/admin/orders"
  return "/admin/products"
}

function isUnread(latestCreatedAt: string | null, lastSeen: string | null) {
  if (!latestCreatedAt) return false
  if (!lastSeen) return true
  return new Date(latestCreatedAt).getTime() > new Date(lastSeen).getTime()
}

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [collapsed, setCollapsed] = useState(false)
  const [query, setQuery] = useState("")
  const [isSigningOut, startSignOut] = useTransition()
  const [latestCreatedAt, setLatestCreatedAt] = useState<string | null>(null)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [hasUnreadOrderNotifications, setHasUnreadOrderNotifications] = useState(false)

  const title = resolveTitle(pathname)
  const searchRoute = resolveSearchRoute(pathname)

  const searchPlaceholder = useMemo(() => {
    if (pathname.startsWith("/admin/orders")) return "Поиск по ID, контакту, статусу..."
    if (pathname.startsWith("/admin/categories")) return "Поиск по названию или slug..."
    return "Поиск по названию товара или категории..."
  }, [pathname])

  useEffect(() => {
    if (pathname === "/admin/login") return

    let isActive = true

    const loadNotifications = async () => {
      try {
        const response = await fetch("/api/admin/orders/notifications", {
          method: "GET",
          cache: "no-store",
        })

        if (!response.ok) {
          return
        }

        const data = (await response.json()) as OrderNotificationResponse
        if (!isActive) return

        setLatestCreatedAt(data.latestCreatedAt)
        setNewOrdersCount(data.newOrdersCount || 0)

        const lastSeen = window.localStorage.getItem(LAST_SEEN_ORDER_KEY)
        setHasUnreadOrderNotifications(isUnread(data.latestCreatedAt, lastSeen))
      } catch {
        // keep silent in UI for background polling
      }
    }

    void loadNotifications()
    const timer = window.setInterval(() => {
      void loadNotifications()
    }, 20000)

    return () => {
      isActive = false
      window.clearInterval(timer)
    }
  }, [pathname])

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const runSearch = () => {
    const value = query.trim()
    if (!value) {
      router.push(searchRoute)
      return
    }
    const next = new URLSearchParams({ q: value })
    router.push(`${searchRoute}?${next.toString()}`)
  }

  const handleSignOut = () => {
    startSignOut(async () => {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success("Выход выполнен")
      router.push("/admin/login")
      router.refresh()
    })
  }

  const openNotifications = () => {
    if (latestCreatedAt) {
      window.localStorage.setItem(LAST_SEEN_ORDER_KEY, latestCreatedAt)
    }
    setHasUnreadOrderNotifications(false)

    if (newOrdersCount > 0) {
      toast.info(`Новых заказов: ${newOrdersCount}`)
    } else {
      toast.info("Нет новых заказов")
    }

    router.push("/admin/orders?status=new")
  }

  return (
    <div className="admin-theme flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "sticky top-0 flex h-screen flex-col border-r border-border bg-card transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="flex h-14 items-center border-b border-border px-4">
          {!collapsed ? <span className="text-lg font-semibold tracking-tight text-foreground">Админ-панель</span> : null}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className={cn(
              "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent",
              collapsed ? "mx-auto" : "ml-auto"
            )}
            aria-label="Свернуть/развернуть меню"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  collapsed ? "justify-center px-2" : ""
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed ? <span>{item.title}</span> : null}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-2 sm:px-6">
          <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>

          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="relative hidden md:flex md:min-w-[180px] md:max-w-[320px] md:flex-1 md:items-center md:gap-2">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="h-9 w-full bg-secondary pl-8 text-sm"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") runSearch()
                }}
              />
              <button
                type="button"
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
                onClick={runSearch}
              >
                Найти
              </button>
            </div>

            <button
              type="button"
              onClick={openNotifications}
              className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent"
              aria-label="Уведомления"
            >
              <Bell className="h-4 w-4" />
              {hasUnreadOrderNotifications ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              ) : null}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              {isSigningOut ? "Выход..." : "Выйти"}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
