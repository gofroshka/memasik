import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import WordCard from '@/components/WordCard'
import FlashcardSession from './FlashcardSession'
import { Word } from '@/lib/types'
import { buttonVariants } from '@/components/ui/button'
import { ArrowLeft, BookOpen, GraduationCap, X } from 'lucide-react'
import { Suspense } from 'react'
import SearchBar from './SearchBar'
import { cn } from '@/lib/utils'
import { getPublishedWords, getUniqueCategories, getAvailableClasses } from '@/lib/repository/words'

interface LearnPageProps {
  searchParams: Promise<{ q?: string; category?: string; mode?: string; textbook_class?: string; textbook_part?: string; textbook_page?: string }>
}

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const { q, category, mode, textbook_class, textbook_part, textbook_page } = await searchParams
  const supabase = await createClient()

  const words = await getPublishedWords(supabase, { q, category, textbook_class, textbook_part, textbook_page })

  // ─── Build current filter params (reused for practice & back links) ───
  const filterParams = new URLSearchParams()
  if (q) filterParams.set('q', q)
  if (category) filterParams.set('category', category)
  if (textbook_class) filterParams.set('textbook_class', textbook_class)
  if (textbook_part) filterParams.set('textbook_part', textbook_part)
  if (textbook_page) filterParams.set('textbook_page', textbook_page)

  // ─── FLASHCARD MODE ─────────────────────────────────────────────
  if (mode === 'practice' && words.length > 0) {
    const backHref = filterParams.size ? `/learn?${filterParams}` : '/learn'
    return <FlashcardSession words={words} category={category} backHref={backHref} />
  }

  // ─── BROWSE MODE ────────────────────────────────────────────────
  const [uniqueCategories, availableClasses] = await Promise.all([
    getUniqueCategories(supabase),
    getAvailableClasses(supabase),
  ])

  const isFiltered = !!(q || category || textbook_class || textbook_part || textbook_page)
  const totalCount = words.length

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">

      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {category ? (
            <>
              <Link
                href="/learn"
                className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Все темы
              </Link>
              <h1 className="text-3xl font-extrabold">{category}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {totalCount > 0
                  ? `${totalCount} ${totalCount === 1 ? 'слово' : totalCount < 5 ? 'слова' : 'слов'}`
                  : 'Слов не найдено'}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold">Все слова</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {totalCount > 0 ? `${totalCount} карточек в библиотеке` : 'Библиотека пуста'}
              </p>
            </>
          )}
        </div>

        {totalCount > 0 && (
          <Link
            href={`/learn?${new URLSearchParams([...filterParams, ['mode', 'practice']])}`}
            className={cn(buttonVariants({ size: 'lg' }), 'shrink-0 gap-2 rounded-xl font-bold')}
          >
            <GraduationCap className="size-5" />
            Учить с карточками
          </Link>
        )}
      </div>

      {/* ─── Search bar ─── */}
      <Suspense>
        <SearchBar
          q={q}
          category={category}
          textbookClass={textbook_class}
          textbookPart={textbook_part}
          textbookPage={textbook_page}
          availableClasses={availableClasses}
        />
      </Suspense>

      {/* ─── Category pills ─── */}
      {uniqueCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={q ? `/learn?q=${encodeURIComponent(q)}` : '/learn'}
            className={cn(
              'inline-flex h-8 items-center rounded-full border px-4 text-sm font-semibold transition-all',
              !category
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary hover:text-foreground'
            )}
          >
            Все
          </Link>
          {uniqueCategories.map(cat => (
            <Link
              key={cat}
              href={`/learn?category=${encodeURIComponent(cat)}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={cn(
                'inline-flex h-8 items-center rounded-full border px-4 text-sm font-semibold transition-all',
                category === cat
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary hover:text-foreground'
              )}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      {/* ─── Word grid ─── */}
      {words.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {words.map(word => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
            <BookOpen className="size-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold">
            {q ? `Ничего не найдено по «${q}»` : 'Слов пока нет'}
          </h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {q ? 'Попробуйте другой запрос' : 'Добавьте первые карточки через панель администратора'}
          </p>
          {isFiltered && (
            <Link
              href="/learn"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-5 gap-1.5')}
            >
              <X className="size-3.5" />
              Сбросить фильтры
            </Link>
          )}
        </div>
      )}

    </div>
  )
}
