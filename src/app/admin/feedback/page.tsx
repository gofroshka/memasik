import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import FeedbackEntryCard from './FeedbackEntryCard'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

interface FeedbackRow {
  id: string
  user_id: string
  email: string | null
  type: string
  status: string
  message: string
  admin_note: string | null
  created_at: string
  updated_at: string
}

const STATUS_TABS = [
  { id: 'all',         label: 'Все' },
  { id: 'new',         label: 'Новые' },
  { id: 'in_progress', label: 'В работе' },
  { id: 'done',        label: 'Готово' },
  { id: 'rejected',    label: 'Отклонено' },
]

export default async function AdminFeedbackPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = params.status ?? 'all'
  const supabase = await createClient()

  const { data: rows } = await supabase.rpc('get_feedback_list' as never)
  const all = ((rows as unknown) as FeedbackRow[] | null) ?? []
  const filtered = status === 'all' ? all : all.filter(r => r.status === status)
  const counts = STATUS_TABS.reduce<Record<string, number>>((acc, t) => {
    acc[t.id] = t.id === 'all' ? all.length : all.filter(r => r.status === t.id).length
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Отзывы и предложения</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {counts.new > 0
            ? `${counts.new} ${counts.new === 1 ? 'новое сообщение' : counts.new < 5 ? 'новых сообщения' : 'новых сообщений'}`
            : 'Все сообщения разобраны'}
        </p>
      </div>

      <div className="inline-flex flex-wrap gap-1.5">
        {STATUS_TABS.map(t => (
          <Link
            key={t.id}
            href={t.id === 'all' ? '/admin/feedback' : `/admin/feedback?status=${t.id}`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
              status === t.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
          >
            {t.label}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                status === t.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-foreground/10 text-foreground',
              )}
            >
              {counts[t.id]}
            </span>
          </Link>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(r => (
            <FeedbackEntryCard key={r.id} entry={r} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <p className="font-semibold">
            {status === 'all' ? 'Сообщений пока нет' : 'В этой категории пусто'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {status === 'all'
              ? 'Когда пользователи начнут писать — появятся здесь.'
              : 'Переключите фильтр выше, чтобы увидеть остальные.'}
          </p>
        </div>
      )}
    </div>
  )
}
