'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, RotateCcw } from 'lucide-react'
import { Word } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ImageWithFallback from '@/components/ImageWithFallback'

interface FlashcardSessionProps {
  words: Word[]
  category?: string
  backHref: string
}

// ─── Completion screen ──────────────────────────────────────────────
function CompletionScreen({
  total,
  onRestart,
  backHref,
}: {
  total: number
  onRestart: () => void
  backHref: string
}) {
  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col items-center justify-center gap-8 px-4 py-10 text-center">
      <div className="space-y-3">
        <div className="text-7xl">🎉</div>
        <h1 className="text-3xl font-extrabold">Все слова запомнены!</h1>
        <p className="text-muted-foreground">Вы прошли все {total} карточек</p>
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
  const [queue, setQueue] = useState<Word[]>([...words])
  const [known, setKnown] = useState<Word[]>([])
  const [isFlipped, setIsFlipped] = useState(false)

  const total = words.length
  const remaining = queue.length
  const isDone = remaining === 0

  const word = queue[0]
  const progress = known.length / total * 100

  const handleReveal = useCallback(() => {
    setIsFlipped(true)
  }, [])

  const handleKnow = useCallback(() => {
    setKnown(k => [...k, queue[0]])
    setQueue(q => q.slice(1))
    setIsFlipped(false)
  }, [queue])

  const handleAgain = useCallback(() => {
    setQueue(q => {
      const [first, ...rest] = q
      return [...rest, first]
    })
    setIsFlipped(false)
  }, [])

  const handleRestart = useCallback(() => {
    setQueue([...words])
    setKnown([])
    setIsFlipped(false)
  }, [words])

  if (isDone) {
    return (
      <CompletionScreen
        total={total}
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

        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="min-w-[48px] text-right text-xs font-bold text-muted-foreground">
          {known.length} / {total}
        </span>
      </div>

      {/* ─── Card area ─── */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="card-scene w-full max-w-sm">
          <div className={cn('card-3d relative h-[440px] sm:h-[480px] w-full', isFlipped && 'is-flipped')}>

            {/* ── Front: guess the translation ── */}
            <div className="card-face absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
              <div className="relative flex-1 overflow-hidden bg-muted">
                <ImageWithFallback
                  src={word.image_url}
                  alt={word.word}
                  imgClassName="h-full w-full object-cover"
                  fallbackIconSize="size-12"
                />
                {category && (
                  <div className="absolute left-3 top-3">
                    <span className="inline-flex rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                      {category}
                    </span>
                  </div>
                )}
                {remaining > 1 && (
                  <div className="absolute right-3 top-3">
                    <span className="inline-flex rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
                      ещё {remaining - 1}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleReveal}
                className="group flex flex-col items-center gap-2 px-6 py-6 text-center hover:bg-muted/40 active:bg-muted/60 transition-colors w-full"
                aria-label="Показать перевод"
              >
                <p className="text-4xl font-extrabold tracking-tight">{word.word}</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                  Вспомни перевод, затем нажми →
                </p>
              </button>
            </div>

            {/* ── Back: translation + mnemonic ── */}
            <div className="card-face card-face-back absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
              <div className="flex flex-col items-center justify-center gap-1.5 px-6 pt-7 pb-4 text-center">
                <p className="text-3xl font-extrabold">{word.word}</p>
                <p className="text-xl font-bold text-primary">{word.translation}</p>
                {word.transcription && (
                  <p className="text-sm text-muted-foreground">[{word.transcription}]</p>
                )}
              </div>

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
          Не запомнил
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
