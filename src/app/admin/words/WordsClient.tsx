'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { List, Plus, Search, Table2, X } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Word } from '@/lib/types'
import WordsListView from './WordsListView'
import WordsTableView from './WordsTableView'
import { sectionMeta, SECTIONS, withSection, type SectionId } from '@/lib/sections'

type Mode = 'list' | 'table'
type SortLang = 'en' | 'ru'
const STORAGE_KEY = 'admin-words-view-mode'
const SORT_LANG_KEY = 'admin-words-sort-lang'

interface Props {
  words: Word[]
  section: SectionId
}

export default function WordsClient({ words, section }: Props) {
  const meta = sectionMeta(section)
  const newWordHref = withSection('/admin/words/new', section)
  const [mode, setMode] = useState<Mode>('list')
  const [sortLang, setSortLang] = useState<SortLang>('en')
  const [hydrated, setHydrated] = useState(false)
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const storedMode = localStorage.getItem(STORAGE_KEY)
    if (storedMode === 'table') setMode('table')
    const storedSort = localStorage.getItem(SORT_LANG_KEY)
    if (storedSort === 'ru') setSortLang('ru')
    setHydrated(true)
  }, [])

  function switchMode(next: Mode) {
    setMode(next)
    setAdding(false)
    localStorage.setItem(STORAGE_KEY, next)
  }

  function switchSortLang(next: SortLang) {
    setSortLang(next)
    setSearch('')
    localStorage.setItem(SORT_LANG_KEY, next)
  }

  const isTable = hydrated && mode === 'table'

  const visibleWords = useMemo(() => {
    const field: 'word' | 'translation' = sortLang === 'en' ? 'word' : 'translation'
    const locale = sortLang === 'en' ? 'en' : 'ru'
    const q = search.trim().toLowerCase()

    const filtered = q
      ? words.filter(w => (w[field] ?? '').toLowerCase().includes(q))
      : words

    return [...filtered].sort((a, b) =>
      (a[field] ?? '').localeCompare(b[field] ?? '', locale, { sensitivity: 'base' })
    )
  }, [words, sortLang, search])

  return (
    <div className="space-y-6">
      {/* Section switcher */}
      <div className="inline-flex overflow-hidden rounded-full border border-border">
        {SECTIONS.map(s => (
          <Link
            key={s.id}
            href={withSection('/admin/words', s.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-1.5 text-sm transition-colors',
              s.id === section
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              s.id !== SECTIONS[0].id && 'border-l border-border'
            )}
          >
            <span>{s.emoji}</span>
            <span>{s.title}</span>
          </Link>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{meta.title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {words.length} {words.length === 1 ? 'запись' : words.length < 5 ? 'записи' : 'записей'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle — desktop only */}
          <div className="hidden overflow-hidden rounded-full border border-border md:inline-flex">
            <button
              onClick={() => switchMode('list')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-1.5 text-sm transition-colors',
                mode === 'list' ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="size-3.5" />
              Список
            </button>
            <button
              onClick={() => switchMode('table')}
              className={cn(
                'flex items-center gap-1.5 border-l border-border px-4 py-1.5 text-sm transition-colors',
                mode === 'table' ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Table2 className="size-3.5" />
              Таблица
            </button>
          </div>

          {/* Add button: inline in table mode, link otherwise */}
          {isTable ? (
            <Button size="sm" className="gap-1.5" onClick={() => setAdding(true)} disabled={adding}>
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">Добавить слово</span>
              <span className="sm:hidden">Добавить</span>
            </Button>
          ) : (
            <Link href={newWordHref} className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}>
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">Добавить слово</span>
              <span className="sm:hidden">Добавить</span>
            </Link>
          )}
        </div>
      </div>

      {/* Search + sort-language toggle */}
      {hydrated && words.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={sortLang === 'en' ? 'Поиск по английскому...' : 'Поиск по русскому...'}
              className="pl-8 pr-8"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Очистить поиск"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="inline-flex overflow-hidden rounded-full border border-border self-start sm:self-auto">
            <button
              onClick={() => switchSortLang('en')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                sortLang === 'en' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              title="Сортировка по английскому слову"
            >
              EN
            </button>
            <button
              onClick={() => switchSortLang('ru')}
              className={cn(
                'border-l border-border px-3 py-1.5 text-xs font-medium transition-colors',
                sortLang === 'ru' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              title="Сортировка по русскому переводу"
            >
              RU
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {words.length === 0 && !adding ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card py-16 text-center shadow-sm">
          <h3 className="font-semibold">Слов ещё нет</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Добавьте первую карточку, чтобы заполнить библиотеку.
          </p>
          <Link href={newWordHref} className={cn(buttonVariants({ size: 'sm' }), 'mt-4 gap-1.5')}>
            <Plus className="size-3.5" />
            Добавить слово
          </Link>
        </div>
      ) : !hydrated ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
          ))}
        </div>
      ) : visibleWords.length === 0 && !adding ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground shadow-sm">
          Ничего не найдено по запросу «{search}»
        </div>
      ) : (
        <>
          {/* Mobile: always list */}
          <div className={isTable ? 'md:hidden' : undefined}>
            <WordsListView words={visibleWords} />
          </div>

          {/* Desktop table mode */}
          {isTable && (
            <div className="hidden md:block">
              <WordsTableView words={visibleWords} adding={adding} onAddingChange={setAdding} section={section} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
