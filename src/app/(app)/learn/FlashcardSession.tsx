'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, RotateCcw, Brain } from 'lucide-react'
import { Word } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FlashcardSessionProps {
  words: Word[]
  category?: string
  backHref: string
}

interface SessionResult {
  known: number
  again: number
  total: number
}

// ─── Completion screen ──────────────────────────────────────────────
function CompletionScreen({
  result,
  onRestart,
  backHref,
}: {
  result: SessionResult
  onRestart: () => void
  backHref: string
}) {
  const allKnown = result.known === result.total

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col items-center justify-center gap-8 px-4 py-10 text-center">
      <div className="space-y-3">
        <div className="text-7xl">{allKnown ? '🎉' : '💪'}</div>
        <h1 className="text-3xl font-extrabold">
          {allKnown ? 'Отличная работа!' : 'Сессия завершена!'}
        </h1>
        <p className="text-muted-foreground">
          {allKnown
            ? `Вы запомнили все ${result.total} слов`
            : `Пройдено ${result.total} карточек`}
        </p>
      </div>

      <div className="flex gap-10">
        <div className="text-center">
          <p className="text-5xl font-extrabold text-emerald-500">{result.known}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Запомнил
          </p>
        </div>
        {result.again > 0 && (
          <div className="text-center">
            <p className="text-5xl font-extrabold text-amber-500">{result.again}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Повторить
            </p>
          </div>
        )}
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button size="lg" onClick={onRestart} className="h-12 text-base font-bold">
          <RotateCcw className="size-4" />
          Пройти ещё раз
        </Button>
        <Link href={backHref} className="w-full">
          <Button variant="outline" size="lg" className="h-12 w-full text-base font-semibold">
            К темам
          </Button>
        </Link>
      </div>
    </div>
  )
}

// ─── Main flashcard session ─────────────────────────────────────────
export default function FlashcardSession({ words, category, backHref }: FlashcardSessionProps) {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [knownCount, setKnownCount] = useState(0)
  const [againCount, setAgainCount] = useState(0)
  const [isDone, setIsDone] = useState(false)

  const word = words[index]
  const progress = (index / words.length) * 100

  const advance = useCallback(() => {
    if (index + 1 >= words.length) {
      setIsDone(true)
    } else {
      setIndex(i => i + 1)
      setIsFlipped(false)
    }
  }, [index, words.length])

  const handleKnow = useCallback(() => {
    setKnownCount(n => n + 1)
    advance()
  }, [advance])

  const handleAgain = useCallback(() => {
    setAgainCount(n => n + 1)
    advance()
  }, [advance])

  const handleRestart = useCallback(() => {
    setIndex(0)
    setIsFlipped(false)
    setKnownCount(0)
    setAgainCount(0)
    setIsDone(false)
  }, [])

  if (isDone) {
    return (
      <CompletionScreen
        result={{ known: knownCount, again: againCount, total: words.length }}
        onRestart={handleRestart}
        backHref={backHref}
      />
    )
  }

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col">

      {/* ─── Progress bar + meta ─── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
        <Link
          href={backHref}
          className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          aria-label="Назад"
        >
          <ArrowLeft className="size-4" />
        </Link>

        {/* Progress track */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <span className="min-w-[48px] text-right text-xs font-bold text-muted-foreground">
          {index + 1} / {words.length}
        </span>
      </div>

      {/* ─── Card area ─── */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="card-scene w-full max-w-sm">
          {/* 3D flip container */}
          <div className={cn('card-3d relative h-[420px] sm:h-[460px] w-full', isFlipped && 'is-flipped')}>

            {/* ── Front face ── */}
            <div className="card-face absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
              {/* Image or placeholder */}
              <div className="relative flex-1 overflow-hidden bg-muted">
                {word.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={word.image_url}
                    alt={word.word}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/8 to-secondary">
                    <Brain className="size-12 text-primary/25" />
                  </div>
                )}

                {/* Category pill */}
                {category && (
                  <div className="absolute left-3 top-3">
                    <span className="inline-flex rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                      {category}
                    </span>
                  </div>
                )}
              </div>

              {/* Word + tap hint */}
              <button
                onClick={() => setIsFlipped(true)}
                className="group flex flex-col items-center gap-2 px-6 py-6 text-center hover:bg-muted/40 active:bg-muted/60 transition-colors w-full"
                aria-label="Показать ассоциацию"
              >
                <p className="text-4xl font-extrabold tracking-tight">{word.word}</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                  Нажми — узнай ассоциацию →
                </p>
              </button>
            </div>

            {/* ── Back face ── */}
            <div className="card-face card-face-back absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
              {/* Word + translation */}
              <div className="flex flex-col items-center justify-center gap-2 px-6 pt-8 pb-4 text-center">
                <p className="text-3xl font-extrabold">{word.word}</p>
                <p className="text-xl font-bold text-primary">{word.translation}</p>
              </div>

              {/* Mnemonic */}
              <div className="mx-5 mb-5 flex-1 overflow-y-auto rounded-xl bg-primary/6 p-5">
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-primary/60">
                  Мнемо-ассоциация
                </p>
                {word.description ? (
                  <p className="text-sm leading-relaxed text-foreground/90">{word.description}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">Ассоциация не добавлена</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Action buttons (appear after flip) ─── */}
      <div
        className={cn(
          'shrink-0 flex gap-3 px-4 pb-6 pt-2 transition-all duration-300',
          isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        <Button
          variant="outline"
          size="lg"
          onClick={handleAgain}
          className="h-14 flex-1 gap-2 rounded-xl text-base font-bold border-2"
        >
          <RotateCcw className="size-4" />
          Ещё раз
        </Button>
        <Button
          size="lg"
          onClick={handleKnow}
          className="h-14 flex-1 gap-2 rounded-xl bg-emerald-500 text-base font-bold text-white hover:bg-emerald-600"
        >
          <Check className="size-4" />
          Запомнил!
        </Button>
      </div>

    </div>
  )
}
