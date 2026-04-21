import { createClient } from '@/lib/supabase/server'
import { BookOpen, Lightbulb, Users } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: wordsCount }, { count: usersCount }, { count: pendingCount }] = await Promise.all([
    supabase.from('words').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('user_suggestions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Обзор</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Краткая сводка по библиотеке и пользователям
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <BookOpen className="size-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-heading text-2xl font-bold">{wordsCount ?? 0}</div>
              <div className="text-xs text-muted-foreground">Слов добавлено</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <Users className="size-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-heading text-2xl font-bold">{usersCount ?? 0}</div>
              <div className="text-xs text-muted-foreground">Пользователей</div>
            </div>
          </div>
        </div>

        <div className={cn(
          'rounded-lg border bg-card p-5 shadow-sm sm:col-span-2 xl:col-span-1',
          (pendingCount ?? 0) > 0 ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-border'
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex size-9 items-center justify-center rounded-md',
              (pendingCount ?? 0) > 0 ? 'bg-yellow-500/15' : 'bg-muted'
            )}>
              <Lightbulb className={cn('size-4', (pendingCount ?? 0) > 0 ? 'text-yellow-600' : 'text-muted-foreground')} />
            </div>
            <div>
              <div className="font-heading text-2xl font-bold">{pendingCount ?? 0}</div>
              <div className="text-xs text-muted-foreground">Предложений на проверке</div>
            </div>
          </div>
          {(pendingCount ?? 0) > 0 && (
            <div className="mt-4">
              <Link
                href="/admin/suggestions"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs')}
              >
                Проверить
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
