"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.refresh()
    router.push("/admin")
  }

  return (
    <Card className="w-full max-w-md rounded-xl border-border shadow-sm">
      <CardHeader>
        <CardTitle>Вход в админ-панель</CardTitle>
        <CardDescription>Введите данные учётной записи</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pb-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </CardContent>
        <CardFooter className="justify-center pt-5">
          <Button
            type="submit"
            className="h-9 w-full min-w-[8rem] rounded-md bg-[var(--color-brand-forest)] px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--color-brand-forest-dark)] disabled:opacity-50 sm:w-auto"
            disabled={loading}
          >
            {loading ? "Вход..." : "Войти"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
