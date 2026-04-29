import { createClient } from '@/lib/supabase/server'
import { BarChart2, BookOpen, Eye, ImageOff, Lightbulb, MessageSquare, ThumbsDown, ThumbsUp, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CHART_H = 120 // px

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const [
    { count: totalWords },
    { count: publishedWords },
    { count: draftWords },
    { count: totalUsers },
    { count: totalViews },
    { count: thumbsUp },
    { count: thumbsDown },
    { count: totalSuggestions },
    { count: pendingSuggestions },
    { data: topViewed },
    { data: topRated },
    { data: usersByMonth },
    { data: viewsByDay },
    { data: noImageWords },
    { data: allWordsStatsRaw },
  ] = await Promise.all([
    supabase.from('words').select('*', { count: 'exact', head: true }),
    supabase.from('words').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('words').select('*', { count: 'exact', head: true }).eq('is_published', false),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('word_views').select('*', { count: 'exact', head: true }),
    supabase.from('word_feedback').select('*', { count: 'exact', head: true }).eq('vote', true),
    supabase.from('word_feedback').select('*', { count: 'exact', head: true }).eq('vote', false),
    supabase.from('user_suggestions').select('*', { count: 'exact', head: true }),
    supabase.from('user_suggestions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.rpc('get_top_viewed_words' as never),
    supabase.rpc('get_top_rated_words' as never),
    supabase.rpc('get_users_by_month' as never),
    supabase.rpc('get_views_by_day' as never),
    supabase.from('words').select('id, word, translation').is('image_url', null).eq('is_published', true).limit(10),
    supabase.rpc('get_all_words_stats' as never),
  ])

  const allWordsStats = (allWordsStatsRaw as { id: string; word: string; translation: string; views: number; up: number; down: number }[] | null) ?? []
  const totalFeedback = (thumbsUp ?? 0) + (thumbsDown ?? 0)
  const positiveRate = totalFeedback > 0 ? Math.round(((thumbsUp ?? 0) / totalFeedback) * 100) : null

  const views = (viewsByDay as { day: string; count: number }[] | null) ?? []
  const users = (usersByMonth as { month: string; count: number }[] | null) ?? []
  const topW = (topViewed as { word: string; translation: string; views: number }[] | null) ?? []
  const topR = (topRated as { word: string; translation: string; up: number; down: number }[] | null) ?? []

  const maxViews = Math.max(...views.map(d => d.count), 1)
  const maxTopW = Math.max(...topW.map(w => w.views), 1)
  const maxUsers = Math.max(...users.map(u => u.count), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Аналитика</h1>
        <p className="mt-1 text-sm text-muted-foreground">Полная картина проекта</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Eye} label="Просмотров" value={totalViews ?? 0} color="text-blue-600 bg-blue-500/10" />
        <Kpi icon={Users} label="Пользователей" value={totalUsers ?? 0} color="text-violet-600 bg-violet-500/10" />
        <Kpi icon={BookOpen} label="Слов" value={totalWords ?? 0} color="text-emerald-600 bg-emerald-500/10" />
        <Kpi icon={MessageSquare} label="Отзывов" value={totalFeedback} color="text-amber-600 bg-amber-500/10" />
      </div>

      {/* Просмотры по дням */}
      <Section title="Просмотры за 14 дней">
        {views.every(d => d.count === 0) ? (
          <Empty text="Просмотров пока нет" />
        ) : (
          <div className="flex items-end gap-1" style={{ height: CHART_H }}>
            {views.map((d) => {
              const barH = Math.max(Math.round((d.count / maxViews) * CHART_H), d.count > 0 ? 4 : 0)
              const label = new Date(d.day).toLocaleDateString('ru', { day: 'numeric', month: 'short' })
              return (
                <div key={d.day} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: CHART_H }}>
                  {d.count > 0 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1 py-0.5 text-[9px] font-bold text-background opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {d.count}
                    </span>
                  )}
                  <div
                    className="w-full rounded-t bg-primary/70 group-hover:bg-primary transition-colors"
                    style={{ height: barH }}
                  />
                  <span className="mt-1.5 block text-center text-[8px] leading-none text-muted-foreground">
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Популярные карточки */}
        <Section title="Популярные карточки" icon={TrendingUp}>
          {topW.length === 0 || topW.every(w => w.views === 0) ? (
            <Empty text="Просмотров пока нет" />
          ) : (
            <div className="space-y-3">
              {topW.filter(w => w.views > 0).map((w, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 text-xs font-bold text-muted-foreground">{i + 1}</span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-baseline gap-1.5 text-sm">
                      <span className="font-semibold truncate">{w.word}</span>
                      <span className="text-xs text-muted-foreground truncate">{w.translation}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary/70" style={{ width: `${(w.views / maxTopW) * 100}%` }} />
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold tabular-nums">{w.views}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Пользователи по месяцам */}
        <Section title="Новые пользователи по месяцам">
          {users.length === 0 ? (
            <Empty text="Нет данных" />
          ) : (
            <div className="space-y-2.5">
              {users.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs text-muted-foreground">
                    {new Date(m.month + '-02').toLocaleDateString('ru', { month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex-1 overflow-hidden rounded-full bg-muted" style={{ height: 20 }}>
                    <div
                      className="h-full rounded-full bg-violet-500/70 transition-all"
                      style={{ width: `${Math.max((m.count / maxUsers) * 100, m.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  <span className="w-5 shrink-0 text-right text-xs font-bold">{m.count}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Отзывы */}
        <Section title="Отзывы об ассоциациях">
          {totalFeedback === 0 ? (
            <Empty text="Отзывов пока нет" />
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1 text-green-600"><ThumbsUp className="size-3" /> {thumbsUp ?? 0} работает</span>
                  <span className="flex items-center gap-1 text-red-500">{thumbsDown ?? 0} не работает <ThumbsDown className="size-3" /></span>
                </div>
                <div className="flex h-3 w-full overflow-hidden rounded-full">
                  <div className="h-full bg-green-500" style={{ width: `${positiveRate}%` }} />
                  <div className="h-full flex-1 bg-red-400" />
                </div>
                <p className="text-center text-xs text-muted-foreground">{positiveRate}% считают ассоциации рабочими</p>
              </div>
              {topR.length > 0 && (
                <div className="space-y-2 border-t border-border pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Лучшие ассоциации</p>
                  {topR.map((w, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">{w.word} <span className="text-xs text-muted-foreground">— {w.translation}</span></span>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600"><ThumbsUp className="size-3" />{w.up}</span>
                        {w.down > 0 && <span className="flex items-center gap-0.5 text-xs text-red-500"><ThumbsDown className="size-3" />{w.down}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Section>

        {/* Библиотека */}
        <Section title="Состояние библиотеки">
          <div className="space-y-4">
            <Bar label="Опубликовано" value={publishedWords ?? 0} total={totalWords ?? 0} color="bg-emerald-500" />
            <Bar label="Черновики" value={draftWords ?? 0} total={totalWords ?? 0} color="bg-amber-400" />
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <Row label="Слов без картинки" value={(noImageWords?.length ?? 0)} />
              <Row label="Предложений на проверке" value={pendingSuggestions ?? 0} highlight={(pendingSuggestions ?? 0) > 0} />
              <Row label="Всего предложений" value={totalSuggestions ?? 0} />
            </div>
          </div>
        </Section>

      </div>

      {/* Детализация по карточкам */}
      <section id="cards" className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold">Детализация по карточкам</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Просмотры и отзывы для каждой карточки</p>
        </div>
        <div className="divide-y divide-border">
          {allWordsStats.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Нет данных</p>
          ) : (
            allWordsStats.map((w) => {
              const total = w.up + w.down
              const rate = total > 0 ? Math.round((w.up / total) * 100) : null
              return (
                <div key={w.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold">{w.word}</span>
                      <span className="text-xs text-muted-foreground">{w.translation}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="size-3" />{w.views}</span>
                      <span className="flex items-center gap-1 text-green-600"><ThumbsUp className="size-3" />{w.up}</span>
                      <span className="flex items-center gap-1 text-red-500"><ThumbsDown className="size-3" />{w.down}</span>
                      {rate !== null && (
                        <span className={rate >= 70 ? 'text-green-600 font-semibold' : rate >= 40 ? 'text-amber-600' : 'text-red-500'}>
                          {rate}% 👍
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/admin/analytics/${w.id}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0 text-xs')}
                  >
                    Подробнее
                  </Link>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* Слова без картинок */}
      {(noImageWords?.length ?? 0) > 0 && (
        <Section title="Опубликованные слова без картинки" icon={ImageOff}>
          <div className="grid gap-2 sm:grid-cols-2">
            {noImageWords!.map(w => (
              <div key={w.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span className="font-medium">{w.word}</span>
                <span className="text-xs text-muted-foreground">{w.translation}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

function Kpi({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className={`inline-flex size-9 items-center justify-center rounded-lg ${color}`}>
        <Icon className="size-4" />
      </div>
      <p className="mt-3 text-2xl font-extrabold">{value.toLocaleString('ru')}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        {title}
      </h2>
      {children}
    </section>
  )
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value} <span className="font-normal text-muted-foreground">({pct}%)</span></span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-amber-600' : ''}`}>{value}</span>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{text}</p>
}
