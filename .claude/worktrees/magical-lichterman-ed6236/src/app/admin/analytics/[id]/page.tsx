import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, Minus, RefreshCw, ThumbsDown, ThumbsUp, TrendingDown, TrendingUp, UserCheck, Users } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props { params: Promise<{ id: string }> }

const CHART_H = 80

export default async function WordAnalyticsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: word }, { data: stats }] = await Promise.all([
    supabase.from('words').select('id, word, translation, image_url, is_published').eq('id', id).single(),
    supabase.rpc('get_word_stats' as never, { p_word_id: id } as never),
  ])

  if (!word) notFound()

  const s = stats as {
    total_views: number; week_views: number; prev_week_views: number
    unique_viewers: number; repeat_visits: number; anon_views: number
    thumbs_up: number; thumbs_down: number
    views_by_day: { day: string; count: number }[]
  } | null

  const totalFeedback = (s?.thumbs_up ?? 0) + (s?.thumbs_down ?? 0)
  const positiveRate = totalFeedback > 0 ? Math.round(((s?.thumbs_up ?? 0) / totalFeedback) * 100) : null
  const authViews = (s?.unique_viewers ?? 0) + (s?.repeat_visits ?? 0)
  const uniqueViewers = s?.unique_viewers ?? 0
  const engagementRate = uniqueViewers > 0 ? ((totalFeedback / uniqueViewers) * 100).toFixed(1) : '0'
  const weekDiff = (s?.week_views ?? 0) - (s?.prev_week_views ?? 0)
  const weekPct = (s?.prev_week_views ?? 0) > 0 ? Math.round((weekDiff / s!.prev_week_views) * 100) : null
  const maxDay = Math.max(...(s?.views_by_day ?? []).map(d => d.count), 1)

  const quality =
    totalFeedback >= 3
      ? (positiveRate ?? 0) >= 70 ? { label: 'Сильная ассоциация', emoji: '🎯', cls: 'border-green-500/30 bg-green-500/8 text-green-700' }
      : (positiveRate ?? 0) >= 40 ? { label: 'Средняя — стоит переработать', emoji: '⚠️', cls: 'border-amber-500/30 bg-amber-500/8 text-amber-700' }
      : { label: 'Слабая — рекомендуется переписать', emoji: '❌', cls: 'border-red-500/30 bg-red-500/8 text-red-700' }
      : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <Link
        href="/admin/analytics#cards"
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit gap-1.5 px-2 text-muted-foreground')}
      >
        <ArrowLeft className="size-3.5" />
        Назад к аналитике
      </Link>

      <div className="flex items-start gap-4">
        {word.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={word.image_url} alt={word.word} className="size-16 shrink-0 rounded-xl object-cover" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{word.word}</h1>
            <span className={cn(
              'rounded-full border px-2 py-0.5 text-xs font-semibold',
              word.is_published ? 'border-green-500/30 text-green-600' : 'border-border text-muted-foreground'
            )}>
              {word.is_published ? 'Опубликовано' : 'Черновик'}
            </span>
          </div>
          <p className="text-muted-foreground">{word.translation}</p>
        </div>
      </div>

      {/* Quality badge */}
      {quality && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${quality.cls}`}>
          {quality.emoji} {quality.label}
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi icon={Eye} label="Всего просмотров" value={s?.total_views ?? 0} />
        <Kpi icon={UserCheck} label="Уникальных" value={s?.unique_viewers ?? 0} sub="открыли хотя бы раз" />
        <Kpi icon={RefreshCw} label="Повторных" value={s?.repeat_visits ?? 0} sub="повторных визитов" />
        <Kpi icon={Users} label="Анонимных" value={s?.anon_views ?? 0} sub="без аккаунта" />
        <Kpi icon={ThumbsUp} label="Работает" value={s?.thumbs_up ?? 0} accent="green" />
        <Kpi icon={ThumbsDown} label="Не работает" value={s?.thumbs_down ?? 0} accent="red" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Bar chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-bold">Просмотры за 7 дней</h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {weekDiff > 0 && <><TrendingUp className="size-3.5 text-green-500" /><span className="text-green-600">+{weekPct ?? weekDiff} {weekPct !== null ? '%' : ''} к прошлой неделе</span></>}
              {weekDiff < 0 && <><TrendingDown className="size-3.5 text-red-400" /><span className="text-red-500">{weekPct ?? weekDiff}{weekPct !== null ? '%' : ''} к прошлой неделе</span></>}
              {weekDiff === 0 && <><Minus className="size-3.5 text-muted-foreground" /><span className="text-muted-foreground">без изменений</span></>}
            </div>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">На этой неделе: {s?.week_views ?? 0}</p>
          <div className="flex items-end gap-1.5" style={{ height: CHART_H }}>
            {(s?.views_by_day ?? []).map((d) => {
              const h = Math.max(Math.round((d.count / maxDay) * CHART_H), d.count > 0 ? 4 : 0)
              return (
                <div key={d.day} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: CHART_H }}>
                  {d.count > 0 && (
                    <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1 py-0.5 text-[9px] font-bold text-background opacity-0 transition-opacity group-hover:opacity-100">
                      {d.count}
                    </span>
                  )}
                  <div className="w-full rounded-t bg-primary/70 transition-colors group-hover:bg-primary" style={{ height: h }} />
                  <span className="mt-1.5 block text-center text-[9px] leading-none text-muted-foreground">{d.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feedback */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold">Отзывы об ассоциации</h2>

          {totalFeedback === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Отзывов пока нет</p>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1 text-green-600"><ThumbsUp className="size-3" />{s?.thumbs_up} работает</span>
                  <span className="flex items-center gap-1 text-red-500">{s?.thumbs_down} не работает<ThumbsDown className="size-3" /></span>
                </div>
                <div className="flex h-3 w-full overflow-hidden rounded-full">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${positiveRate}%` }} />
                  <div className="h-full flex-1 bg-red-400" />
                </div>
                <p className="text-center text-xs text-muted-foreground">{positiveRate}% положительных</p>
              </div>

              <div className="rounded-lg bg-muted/40 px-4 py-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Вовлечённость</span>
                  <span className="font-bold">{engagementRate}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(parseFloat(engagementRate), 100)}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground">{totalFeedback} из {uniqueViewers} уникальных пользователей оставили отзыв</p>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link href={`/admin/words/${word.id}/edit`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}>
          Редактировать карточку
        </Link>
        <Link href={`/words/${word.id}`} target="_blank" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5 text-muted-foreground')}>
          Открыть карточку →
        </Link>
      </div>
    </div>
  )
}

function Kpi({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: number; sub?: string; accent?: 'green' | 'red'
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-1">
      <Icon className={`size-4 ${accent === 'green' ? 'text-green-500' : accent === 'red' ? 'text-red-400' : 'text-muted-foreground'}`} />
      <p className={`text-2xl font-extrabold ${accent === 'green' ? 'text-green-600' : accent === 'red' ? 'text-red-500' : ''}`}>{value}</p>
      <p className="text-[10px] font-semibold text-muted-foreground leading-tight">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  )
}
