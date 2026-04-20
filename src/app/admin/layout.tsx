import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, LayoutDashboard, Shield } from 'lucide-react'
import AdminSignOut from './AdminSignOut'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <Link href="/" className="flex items-center gap-2 font-extrabold">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-3.5" />
          </div>
          Мемасик
        </Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Shield className="size-3" />
          Админ
        </div>
      </header>

      {/* Sidebar */}
      <aside className="hidden border-r border-border bg-card md:flex md:min-h-screen md:flex-col">
        <div className="border-b border-border p-4">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="size-4" />
            </div>
            Мемасик
          </Link>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="size-3" />
            Панель администратора
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'w-full justify-start gap-2 font-semibold text-muted-foreground hover:text-foreground'
            )}
          >
            <LayoutDashboard className="size-4" />
            Обзор
          </Link>
          <Link
            href="/admin/words"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'w-full justify-start gap-2 font-semibold text-muted-foreground hover:text-foreground'
            )}
          >
            <BookOpen className="size-4" />
            Слова и карточки
          </Link>
        </nav>

        <div className="border-t border-border p-3">
          <p className="mb-2 truncate px-2 text-xs text-muted-foreground">{user.email}</p>
          <AdminSignOut />
        </div>
      </aside>

      {/* Main */}
      <main className="overflow-y-auto p-5 pb-20 md:p-8">
        {children}
      </main>
    </div>
  )
}
