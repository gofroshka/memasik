'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { List, Plus, Table2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Word } from '@/lib/types'
import WordsListView from './WordsListView'
import WordsTableView from './WordsTableView'

type Mode = 'list' | 'table'
const STORAGE_KEY = 'admin-words-view-mode'

interface Props {
  words: Word[]
}

export default function WordsClient({ words }: Props) {
  const [mode, setMode] = useState<Mode>('list')
  const [hydrated, setHydrated] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'table') setMode('table')
    setHydrated(true)
  }, [])

  function switchMode(next: Mode) {
    setMode(next)
    setAdding(false)
    localStorage.setItem(STORAGE_KEY, next)
  }

  const isTable = hydrated && mode === 'table'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Слова и ассоциации</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {words.length} {words.length === 1 ? 'запись' : words.length < 5 ? 'записи' : 'записей'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle — desktop only */}
          <div className="hidden overflow-hidden rounded-lg border border-border md:inline-flex">
            <button
              onClick={() => switchMode('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors',
                mode === 'list' ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="size-3.5" />
              Список
            </button>
            <button
              onClick={() => switchMode('table')}
              className={cn(
                'flex items-center gap-1.5 border-l border-border px-3 py-1.5 text-xs transition-colors',
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
            <Link href="/admin/words/new" className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}>
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">Добавить слово</span>
              <span className="sm:hidden">Добавить</span>
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      {words.length === 0 && !adding ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card py-16 text-center shadow-sm">
          <h3 className="font-semibold">Слов ещё нет</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Добавьте первую карточку, чтобы заполнить библиотеку.
          </p>
          <Link href="/admin/words/new" className={cn(buttonVariants({ size: 'sm' }), 'mt-4 gap-1.5')}>
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
      ) : (
        <>
          {/* Mobile: always list */}
          <div className={isTable ? 'md:hidden' : undefined}>
            <WordsListView words={words} />
          </div>

          {/* Desktop table mode */}
          {isTable && (
            <div className="hidden md:block">
              <WordsTableView words={words} adding={adding} onAddingChange={setAdding} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
