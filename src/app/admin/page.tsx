import { createClient } from '@/lib/supabase/server'
import {
  ArrowRight, BookOpen, BookOpenCheck, Clock, FileEdit,
  Lightbulb, Plus, ThumbsDown, ThumbsUp, TrendingDown,
  TrendingUp, Eye, Users, BarChart2, Minus,
} from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OverviewStats {
  today_views: number
  yesterday_views: number
  week_views: number
  total_views: number
  total_users: number
  new_users_week: number
  published: number
  drafts: number
  pending: number
  thumbs_up: number
  thumbs_down: number
  recent_views: { word_id: string; viewed_at: string; word: string; translation: string }[] | null
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: raw } = await supabase.rpc('get_overview_stats' as never)
  const s = raw as OverviewStats

  const totalWords = s.published + s.drafts
  const totalFeedback = s.thumbs_up + s.thumbs_down
  const positiveRate = totalFeedback > 0 ? Math.round((s.thumbs_up / totalFeedback) * 100) : null

  const viewDiff = s.today_views - s.yesterday_views
  const viewTrend = viewDiff > 0 ? 'up' : viewDiff < 0 ? 'down' : 'flat'

  const publishedPct = totalWords > 0 ? Math.round((s.published / totalWords) * 100) : 0

  const now = new Date()
  const greeting =
    now.getHours() < 12 ? 'Доброе утро' :
    now.getHours() < 18 ? 'Добрый день' : 'Добрый вечер'

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{greeting} 👋</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {now.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          href="/admin/words/new"
          className={cn(buttonVariants({ size: 'sm' }), 'shrink-0 gap-1.5')}
        >
          <Plus className="size-3.5" />
          Новое слово
        </Link>
      </div>

      {/* Today pulse */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Eye}
          label="Просмотров сегодня"
          value={s.today_views}
          trend={viewTrend}
          trendLabel={
            s.yesterday_views > 0
              ? `${viewDiff > 0 ? '+' : ''}${viewDiff} vs вчера`
              : 'вчера не было'
          }
          color="blue"
        />
        <StatCard
          icon={Eye}
          label="За 7 дней"
          value={s.week_views}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Пользователей"
          value={s.total_users}
          trendLabel={s.new_users_week > 0 ? `+${s.new_users_week} за неделю` : undefined}
          color="violet"
        />
        <StatCard
          icon={Lightbulb}
          label="На проверке"
          value={s.pending}
          color={s.pending > 0 ? 'amber' : 'default'}
          href={s.pending > 0 ? '/admin/suggestions' : undefined}
          hrefLabel="Проверить"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Library */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              Библиотека слов
            </h2>
            <Link
              href="/admin/words"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Все слова <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="flex items-end gap-4">
            <div>
              <p className="text-4xl font-extrabold">{totalWords}</p>
              <p className="text-xs text-muted-foreground">всего слов</p>
            </div>
            <div className="flex gap-3 pb-1 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <BookOpenCheck className="size-3.5" />{s.published} опубликовано
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <FileEdit className="size-3.5" />{s.drafts} черновик{s.drafts !== 1 ? 'ов' : ''}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Опубликовано</span>
              <span className="font-semibold text-foreground">{publishedPct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${publishedPct}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/words/new"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5 text-xs')}
            >
              <Plus className="size-3" /> Добавить слово
            </Link>
            {s.drafts > 0 && (
              <Link
                href="/admin/words?filter=draft"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5 text-xs text-muted-foreground')}
              >
                Просмотреть черновики
              </Link>
            )}
          </div>
        </section>

        {/* Feedback */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <ThumbsUp className="size-4 text-muted-foreground" />
              Отзывы об ассоциациях
            </h2>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Аналитика <ArrowRight className="size-3" />
            </Link>
          </div>

          {totalFeedback === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Отзывов пока нет</p>
          ) : (
            <>
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-4xl font-extrabold">{positiveRate}%</p>
                  <p className="text-xs text-muted-foreground">положительных</p>
                </div>
                <div className="flex gap-3 pb-1 text-sm">
                  <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                    <ThumbsUp className="size-3.5" />{s.thumbs_up}
                  </span>
                  <span className="flex items-center gap-1.5 text-red-500 font-semibold">
                    <ThumbsDown className="size-3.5" />{s.thumbs_down}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex h-3 w-full overflow-hidden rounded-full">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${positiveRate}%` }} />
                  <div className="h-full flex-1 bg-red-400" />
                </div>
                <p className="text-xs text-muted-foreground">{totalFeedback} отзывов всего</p>
              </div>

              <div className={cn(
                'rounded-lg border px-4 py-2.5 text-xs font-semibold',
                (positiveRate ?? 0) >= 70
                  ? 'border-green-500/30 bg-green-500/8 text-green-700'
                  : (positiveRate ?? 0) >= 40
                  ? 'border-amber-500/30 bg-amber-500/8 text-amber-700'
                  : 'border-red-500/30 bg-red-500/8 text-red-700'
              )}>
                {(positiveRate ?? 0) >= 70
                  ? '🎯 Ассоциации хорошо работают'
                  : (positiveRate ?? 0) >= 40
                  ? '⚠️ Есть карточки требующие доработки'
                  : '❌ Много слабых ассоциаций — нужна доработка'}
              </div>
            </>
          )}
        </section>

      </div>

      {/* Recent activity */}
      <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            Недавние просмотры
          </h2>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Все данные <ArrowRight className="size-3" />
          </Link>
        </div>
        {!s.recent_views || s.recent_views.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Просмотров пока нет</p>
        ) : (
          <div className="divide-y divide-border">
            {s.recent_views.map((r) => {
              const date = new Date(r.viewed_at)
              const timeAgo = formatTimeAgo(date)
              return (
                <div key={r.word_id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Eye className="size-3.5 text-primary/60" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-semibold text-sm">{r.word}</span>
                      <span className="text-xs text-muted-foreground truncate">{r.translation}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                    <Link
                      href={`/admin/analytics/${r.word_id}`}
                      className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-7 px-2 text-xs text-muted-foreground')}
                    >
                      <BarChart2 className="size-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section className="grid gap-3 sm:grid-cols-3">
        <QuickAction
          href="/admin/words/new"
          icon={Plus}
          title="Добавить слово"
          desc="Создать новую карточку"
          color="bg-primary/10 text-primary"
        />
        <QuickAction
          href="/admin/suggestions"
          icon={Lightbulb}
          title="Предложения"
          desc={s.pending > 0 ? `${s.pending} ожидают проверки` : 'Нет новых предложений'}
          color={s.pending > 0 ? 'bg-amber-500/15 text-amber-600' : 'bg-muted text-muted-foreground'}
          badge={s.pending > 0 ? s.pending : undefined}
        />
        <QuickAction
          href="/admin/analytics"
          icon={BarChart2}
          title="Аналитика"
          desc={`${s.total_views.toLocaleString('ru')} просмотров всего`}
          color="bg-violet-500/10 text-violet-600"
        />
      </section>

    </div>
  )
}

function StatCard({
  icon: Icon, label, value, trend, trendLabel, color, href, hrefLabel,
}: {
  icon: React.ElementType
  label: string
  value: number
  trend?: 'up' | 'down' | 'flat'
  trendLabel?: string
  color: 'blue' | 'violet' | 'amber' | 'default'
  href?: string
  hrefLabel?: string
}) {
  const colors = {
    blue:    'bg-blue-500/10 text-blue-600',
    violet:  'bg-violet-500/10 text-violet-600',
    amber:   'bg-amber-500/15 text-amber-600',
    default: 'bg-muted text-muted-foreground',
  }

  return (
    <div className={cn(
      'rounded-xl border bg-card p-4 shadow-sm space-y-2',
      color === 'amber' ? 'border-amber-500/30 bg-amber-500/5' : 'border-border'
    )}>
      <div className={cn('inline-flex size-8 items-center justify-center rounded-lg', colors[color])}>
        <Icon className="size-4" />
      </div>
      <p className="text-2xl font-extrabold">{value.toLocaleString('ru')}</p>
      <p className="text-[10px] font-semibold text-muted-foreground leading-tight">{label}</p>
      {trendLabel && (
        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
          {trend === 'up' && <TrendingUp className="size-3 text-green-500" />}
          {trend === 'down' && <TrendingDown className="size-3 text-red-400" />}
          {trend === 'flat' && <Minus className="size-3" />}
          {trendLabel}
        </p>
      )}
      {href && hrefLabel && (
        <Link href={href} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-6 px-2 text-[10px]')}>
          {hrefLabel}
        </Link>
      )}
    </div>
  )
}

function QuickAction({
  href, icon: Icon, title, desc, color, badge,
}: {
  href: string
  icon: React.ElementType
  title: string
  desc: string
  color: string
  badge?: number
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/30 hover:bg-muted/30 transition-colors"
    >
      <div className={cn('relative flex size-10 shrink-0 items-center justify-center rounded-xl', color)}>
        <Icon className="size-5" />
        {badge !== undefined && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
            {badge}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold group-hover:text-primary transition-colors">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{desc}</p>
      </div>
      <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
    </Link>
  )
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'только что'
  if (diffMin < 60) return `${diffMin} мин. назад`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH} ч. назад`
  const diffD = Math.floor(diffH / 24)
  return `${diffD} дн. назад`
}
