import { createClient } from '@/lib/supabase/server'
import { BookOpen, FolderKanban, Users } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: wordsCount }, { count: usersCount }] = await Promise.all([
    supabase.from('words').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
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

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium">Что дальше</p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Используйте раздел слов для пополнения и редактирования библиотеки.
          </p>
          <div className="mt-4">
            <Link
              href="/admin/words"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs')}
            >
              Перейти к словам
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
