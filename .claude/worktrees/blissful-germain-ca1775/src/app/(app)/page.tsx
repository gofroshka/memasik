import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { ArrowRight, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

// Color palettes for category cards (index-based)
const CATEGORY_COLORS = [
  { bg: 'bg-violet-100', border: 'border-violet-200', text: 'text-violet-700', hover: 'hover:bg-violet-150 hover:border-violet-300' },
  { bg: 'bg-blue-100',   border: 'border-blue-200',   text: 'text-blue-700',   hover: 'hover:bg-blue-150   hover:border-blue-300' },
  { bg: 'bg-emerald-100',border: 'border-emerald-200',text: 'text-emerald-700',hover: 'hover:bg-emerald-150 hover:border-emerald-300' },
  { bg: 'bg-amber-100',  border: 'border-amber-200',  text: 'text-amber-700',  hover: 'hover:bg-amber-150  hover:border-amber-300' },
  { bg: 'bg-rose-100',   border: 'border-rose-200',   text: 'text-rose-700',   hover: 'hover:bg-rose-150   hover:border-rose-300' },
  { bg: 'bg-cyan-100',   border: 'border-cyan-200',   text: 'text-cyan-700',   hover: 'hover:bg-cyan-150   hover:border-cyan-300' },
  { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-700', hover: 'hover:bg-orange-150 hover:border-orange-300' },
  { bg: 'bg-pink-100',   border: 'border-pink-200',   text: 'text-pink-700',   hover: 'hover:bg-pink-150   hover:border-pink-300' },
] as const

const CATEGORY_EMOJIS: Record<string, string> = {
  животные: '🐾', animals: '🐾',
  еда: '🍎', food: '🍎',
  цвета: '🎨', colors: '🎨',
  числа: '🔢', numbers: '🔢',
  тело: '🫁', body: '🫁',
  дом: '🏠', home: '🏠',
  природа: '🌿', nature: '🌿',
  транспорт: '🚗', transport: '🚗',
  одежда: '👕', clothes: '👕',
  профессии: '👩‍⚕️', jobs: '👩‍⚕️',
  школа: '✏️', school: '✏️',
  спорт: '⚽', sport: '⚽',
  погода: '☀️', weather: '☀️',
  семья: '👨‍👩‍👧', family: '👨‍👩‍👧',
  фрукты: '🍉', fruits: '🍉',
  овощи: '🥕', vegetables: '🥕',
}

function getCategoryEmoji(name: string) {
  const lower = name.toLowerCase().trim()
  return CATEGORY_EMOJIS[lower] ?? '📖'
}

function wordCountLabel(n: number) {
  if (n === 1) return '1 слово'
  if (n >= 2 && n <= 4) return `${n} слова`
  return `${n} слов`
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ count: total }, { data: catRows }] = await Promise.all([
    supabase.from('words').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('words').select('category').eq('is_published', true).not('category', 'is', null),
  ])

  const categoryCounts = (catRows ?? []).reduce<Record<string, number>>((acc, row) => {
    if (row.category) acc[row.category] = (acc[row.category] ?? 0) + 1
    return acc
  }, {})

  const categories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])
  const hasCategories = categories.length > 0

  return (
    <div className="mx-auto max-w-5xl space-y-12 py-10 px-4">

      {/* ─── Greeting ─── */}
      <section className="space-y-3 text-center">
        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
          Учим слова через образы 🧠
        </h1>
        <p className="mx-auto max-w-md text-base text-muted-foreground">
          {hasCategories
            ? 'Выбери тему — и начни прямо сейчас'
            : 'Библиотека скоро пополнится новыми карточками'}
        </p>
      </section>

      {/* ─── Category grid ─── */}
      {hasCategories ? (
        <section className="space-y-4">
          {/* Browse all */}
          <div className="text-center">
            <Link
              href="/learn"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5 text-muted-foreground')}
            >
              <BookOpen className="size-3.5" />
              Все {total ?? 0} слов в одном списке
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map(([cat, count], i) => {
              const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length]
              const emoji = getCategoryEmoji(cat)
              return (
                <Link
                  key={cat}
                  href={`/learn?category=${encodeURIComponent(cat)}`}
                  className={cn(
                    'group flex flex-col gap-3 rounded-2xl border p-5 transition-all duration-150',
                    'hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm',
                    color.bg, color.border, color.hover
                  )}
                >
                  <span className="text-3xl leading-none" aria-hidden="true">{emoji}</span>
                  <div className="space-y-0.5">
                    <p className={cn('text-sm font-bold leading-tight', color.text)}>{cat}</p>
                    <p className="text-xs text-muted-foreground">{wordCountLabel(count)}</p>
                  </div>
                  <ArrowRight className={cn('mt-auto size-4 opacity-0 transition-opacity group-hover:opacity-60', color.text)} />
                </Link>
              )
            })}
          </div>
        </section>
      ) : (
        /* No categories — show library link */
        <section className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-4xl">📚</p>
          <h2 className="mt-4 text-xl font-bold">Библиотека пока пуста</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Добавьте первые карточки через панель администратора
          </p>
          <Link href="/admin" className={cn(buttonVariants({ size: 'sm' }), 'mt-6')}>
            Открыть панель
          </Link>
        </section>
      )}

      {/* ─── How it works — for parents ─── */}
      <section className="rounded-2xl bg-secondary/60 px-6 py-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { n: '1', title: 'Выбрать тему', text: 'Животные, еда, числа — всё по категориям' },
            { n: '2', title: 'Учить по карточкам', text: 'Слово → образ → ассоциация, одна карточка за раз' },
            { n: '3', title: 'Повторять снова', text: 'Вернитесь через день — и слово останется навсегда' },
          ].map(step => (
            <div key={step.n} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
                {step.n}
              </span>
              <div>
                <p className="text-sm font-bold">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
