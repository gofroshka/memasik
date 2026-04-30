import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function UsersListPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase.rpc('get_users_list' as never)
  const users = (rows as { email: string; created_at: string }[] | null) ?? []

  return (
    <div className="space-y-6">
      <Link
        href="/admin/analytics"
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit gap-1.5 px-2 text-muted-foreground')}
      >
        <ArrowLeft className="size-3.5" />
        Назад к аналитике
      </Link>

      <div className="flex items-center gap-3">
        <div className="inline-flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
          <Users className="size-4" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Пользователи</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Всего: {users.length.toLocaleString('ru')}</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {users.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Пользователей пока нет</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Почта</th>
                  <th className="px-5 py-3">Дата регистрации</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.email} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">{u.email}</td>
                    <td className="px-5 py-3 text-muted-foreground tabular-nums">
                      {new Date(u.created_at).toLocaleString('ru', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
