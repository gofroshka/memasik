'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from '@/app/actions/auth'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, null)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">

      {/* Back */}
      <div className="mb-6 w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          На главную
        </Link>
      </div>

      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="space-y-1.5 text-center">
          <div className="mx-auto text-5xl">🧠</div>
          <h1 className="text-2xl font-extrabold">С возвращением!</h1>
          <p className="text-sm text-muted-foreground">
            Войдите, чтобы продолжить учиться
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-6">
            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-semibold">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="font-semibold">Пароль</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-10"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/25 bg-destructive/6 px-4 py-3">
                  <p className="text-sm font-semibold text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={pending} className="h-11 w-full text-base font-bold">
                {pending ? 'Входим...' : 'Войти'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Нет аккаунта?{' '}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
