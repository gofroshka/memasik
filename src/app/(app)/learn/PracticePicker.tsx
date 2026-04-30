'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, GraduationCap, Layers, Shuffle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { SectionId } from '@/lib/sections'

type Mode = 'all' | 'category' | 'textbook'

interface Props {
  section: SectionId
  categories: string[]
  availableClasses: number[]
  initial: {
    category?: string
    textbookClass?: string
    textbookPart?: string
    textbookPage?: string
    shuffle?: boolean
  }
  matchedCount: number
}

const selectClass = 'h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export default function PracticePicker({ section, categories, availableClasses, initial, matchedCount }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const initialMode: Mode = initial.category
    ? 'category'
    : (initial.textbookClass || initial.textbookPart || initial.textbookPage)
      ? 'textbook'
      : 'all'

  const [mode, setMode] = useState<Mode>(initialMode)
  const [category, setCategory] = useState(initial.category ?? '')
  const [tClass, setTClass] = useState(initial.textbookClass ?? '')
  const [tPart, setTPart] = useState(initial.textbookPart ?? '')
  const [tPage, setTPage] = useState(initial.textbookPage ?? '')
  const [shuffle, setShuffle] = useState(initial.shuffle ?? false)

  function buildParams(extra: Record<string, string> = {}) {
    const params = new URLSearchParams()
    params.set('section', section)
    if (mode === 'category' && category) params.set('category', category)
    if (mode === 'textbook') {
      if (tClass) params.set('textbook_class', tClass)
      if (tPart) params.set('textbook_part', tPart)
      if (tPage) params.set('textbook_page', tPage)
    }
    if (shuffle) params.set('shuffle', '1')
    for (const [k, v] of Object.entries(extra)) params.set(k, v)
    return params
  }

  function applyMode(next: Mode) {
    if (next === mode) return
    setMode(next)
    // Apply selection right away so the browse grid below reflects the choice.
    const params = new URLSearchParams()
    params.set('section', section)
    if (next === 'category' && category) params.set('category', category)
    if (next === 'textbook') {
      if (tClass) params.set('textbook_class', tClass)
      if (tPart) params.set('textbook_part', tPart)
      if (tPage) params.set('textbook_page', tPage)
    }
    if (shuffle) params.set('shuffle', '1')
    startTransition(() => router.push(`/learn?${params}`))
  }

  function applyFilters() {
    startTransition(() => router.push(`/learn?${buildParams()}`))
  }

  function startPractice() {
    if (matchedCount === 0) return
    startTransition(() => router.push(`/learn?${buildParams({ mode: 'practice' })}`))
  }

  const canStart = matchedCount > 0
  const startLabel = matchedCount === 0
    ? 'Нет слов для тренировки'
    : `Учить — ${matchedCount} ${matchedCount === 1 ? 'карточка' : matchedCount < 5 ? 'карточки' : 'карточек'}`

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-sm font-bold">Подборка для тренировки</h2>
      </div>

      {/* Mode tabs */}
      <div className="flex flex-wrap gap-1.5">
        <ModeTab icon={Layers} label="Все слова" active={mode === 'all'} onClick={() => applyMode('all')} />
        <ModeTab icon={BookOpen} label="По теме" active={mode === 'category'} onClick={() => applyMode('category')} disabled={categories.length === 0} />
        <ModeTab icon={GraduationCap} label="По учебнику" active={mode === 'textbook'} onClick={() => applyMode('textbook')} disabled={availableClasses.length === 0} />
      </div>

      {/* Mode-specific controls */}
      {mode === 'category' && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={e => {
              const val = e.target.value
              setCategory(val)
              const params = new URLSearchParams()
              params.set('section', section)
              if (val) params.set('category', val)
              if (shuffle) params.set('shuffle', '1')
              startTransition(() => router.push(`/learn?${params}`))
            }}
            className={cn(selectClass, 'min-w-[200px]')}
          >
            <option value="">Выберите тему…</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      {mode === 'textbook' && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={tClass}
            onChange={e => {
              const val = e.target.value
              setTClass(val)
              if (!val) setTPart('')
            }}
            className={selectClass}
          >
            <option value="">Все классы</option>
            {availableClasses.map(c => (
              <option key={c} value={c}>{c} класс</option>
            ))}
          </select>
          {tClass && (
            <select value={tPart} onChange={e => setTPart(e.target.value)} className={selectClass}>
              <option value="">Обе части</option>
              <option value="1">Часть 1</option>
              <option value="2">Часть 2</option>
            </select>
          )}
          <Input
            type="number"
            min={1}
            value={tPage}
            onChange={e => setTPage(e.target.value)}
            placeholder="Страница"
            className="h-9 w-28"
          />
          <Button type="button" variant="outline" size="sm" onClick={applyFilters} disabled={pending}>
            Применить
          </Button>
        </div>
      )}

      {/* Footer: shuffle + CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground select-none">
          <input
            type="checkbox"
            checked={shuffle}
            onChange={e => setShuffle(e.target.checked)}
            className="size-4 rounded border-input accent-primary"
          />
          <Shuffle className="size-3.5" />
          Перемешать карточки
        </label>
        <Button
          type="button"
          size="lg"
          onClick={startPractice}
          disabled={!canStart || pending}
          className="gap-2 rounded-xl font-bold"
        >
          <GraduationCap className="size-4" />
          {startLabel}
        </Button>
      </div>
    </div>
  )
}

function ModeTab({
  icon: Icon, label, active, onClick, disabled,
}: { icon: React.ElementType; label: string; active: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
        disabled && 'cursor-not-allowed opacity-40',
        !disabled && active && 'border-primary/40 bg-primary/10 text-primary',
        !disabled && !active && 'border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground',
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  )
}
