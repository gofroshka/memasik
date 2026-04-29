import { Eye, ThumbsUp, ThumbsDown, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Stats {
  total_views: number
  week_views: number
  prev_week_views: number
  unique_viewers: number
  thumbs_up: number
  thumbs_down: number
  views_by_day: { day: string; count: number }[]
}

const CHART_H = 56

export default function WordStats({ stats }: { stats: Stats }) {
  const {
    total_views, week_views, prev_week_views,
    unique_viewers, thumbs_up, thumbs_down, views_by_day,
  } = stats

  const totalFeedback = thumbs_up + thumbs_down
  const positiveRate = totalFeedback > 0 ? Math.round((thumbs_up / totalFeedback) * 100) : null
  const engagementRate = total_views > 0 ? Math.round((totalFeedback / total_views) * 100) : 0

  const weekDiff = week_views - prev_week_views
  const weekPct = prev_week_views > 0 ? Math.round((weekDiff / prev_week_views) * 100) : null

  const maxDay = Math.max(...(views_by_day ?? []).map(d => d.count), 1)

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-bold">Аналитика карточки</h2>
      </div>

      <div className="p-5 space-y-5">

        {/* Mini bar chart — 7 days */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Просмотры за 7 дней</p>
          <div className="flex items-end gap-1" style={{ height: CHART_H }}>
            {(views_by_day ?? []).map((d) => {
              const h = Math.max(Math.round((d.count / maxDay) * CHART_H), d.count > 0 ? 3 : 0)
              return (
                <div key={d.day} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: CHART_H }}>
                  {d.count > 0 && (
                    <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1 py-0.5 text-[9px] font-bold text-background opacity-0 transition-opacity group-hover:opacity-100">
                      {d.count}
                    </span>
                  )}
                  <div
                    className="w-full rounded-t bg-primary/70 transition-colors group-hover:bg-primary"
                    style={{ height: h }}
                  />
                  <span className="mt-1 block text-center text-[8px] leading-none text-muted-foreground">{d.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">

          <StatCard
            icon={Eye}
            label="Всего просмотров"
            value={total_views}
            sub={
              weekPct !== null
                ? weekDiff > 0 ? `+${weekPct}% за неделю` : weekDiff < 0 ? `${weekPct}% за неделю` : 'без изменений'
                : `${week_views} за неделю`
            }
            trend={weekDiff > 0 ? 'up' : weekDiff < 0 ? 'down' : 'flat'}
          />

          <StatCard
            icon={Users}
            label="Уникальных читателей"
            value={unique_viewers}
            sub="авторизованных"
          />

          <StatCard
            icon={ThumbsUp}
            label="Ассоциация работает"
            value={thumbs_up}
            sub={positiveRate !== null ? `${positiveRate}% положительных` : 'нет отзывов'}
            accent={thumbs_up > 0 ? 'green' : undefined}
          />

          <StatCard
            icon={ThumbsDown}
            label="Не работает"
            value={thumbs_down}
            sub={totalFeedback > 0 ? `${100 - (positiveRate ?? 0)}% отрицательных` : 'нет отзывов'}
            accent={thumbs_down > 0 ? 'red' : undefined}
          />

        </div>

        {/* Engagement */}
        <div className="rounded-lg bg-muted/40 px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Вовлечённость</span>
            <span className="font-bold">{engagementRate}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(engagementRate, 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            {totalFeedback} из {total_views} просмотров оставили отзыв
          </p>
        </div>

        {/* Quality score */}
        {totalFeedback >= 3 && (
          <div className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
            (positiveRate ?? 0) >= 70
              ? 'border-green-500/30 bg-green-500/8 text-green-700'
              : (positiveRate ?? 0) >= 40
              ? 'border-amber-500/30 bg-amber-500/8 text-amber-700'
              : 'border-red-500/30 bg-red-500/8 text-red-700'
          }`}>
            {(positiveRate ?? 0) >= 70
              ? '🎯 Сильная ассоциация — большинство запоминают'
              : (positiveRate ?? 0) >= 40
              ? '⚠️ Средняя ассоциация — стоит переработать'
              : '❌ Слабая ассоциация — рекомендуется переписать'}
          </div>
        )}

      </div>
    </div>
  )
}

function StatCard({
  icon: Icon, label, value, sub, trend, accent,
}: {
  icon: React.ElementType
  label: string
  value: number
  sub?: string
  trend?: 'up' | 'down' | 'flat'
  accent?: 'green' | 'red'
}) {
  const accentClass = accent === 'green' ? 'text-green-600' : accent === 'red' ? 'text-red-500' : 'text-foreground'

  return (
    <div className="rounded-lg border border-border p-3 space-y-1">
      <div className="flex items-center justify-between">
        <Icon className={`size-3.5 ${accent === 'green' ? 'text-green-500' : accent === 'red' ? 'text-red-400' : 'text-muted-foreground'}`} />
        {trend === 'up' && <TrendingUp className="size-3 text-green-500" />}
        {trend === 'down' && <TrendingDown className="size-3 text-red-400" />}
        {trend === 'flat' && <Minus className="size-3 text-muted-foreground" />}
      </div>
      <p className={`text-xl font-extrabold ${accentClass}`}>{value}</p>
      <p className="text-[10px] font-semibold text-muted-foreground leading-tight">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  )
}
