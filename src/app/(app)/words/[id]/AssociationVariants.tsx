'use client'

import { useState, useTransition } from 'react'
import { Check, ChevronDown, FileText, Star, ThumbsDown, ThumbsUp } from 'lucide-react'
import { AssociationVariant } from '@/lib/types'
import SpeakButton from '@/components/SpeakButton'
import ImageWithFallback from '@/components/ImageWithFallback'
import { submitFeedbackAction } from '@/app/actions/feedback'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface VariantFeedback {
  up: number
  down: number
  userVote: boolean | null
}

interface Props {
  wordId: string
  variants: AssociationVariant[]
  feedback: Record<string, VariantFeedback>
  isAuthenticated: boolean
}

function variantLabel(v: AssociationVariant, i: number): string {
  return v.short_description?.trim() || (i === 0 ? 'Основной' : `Вариант ${i + 1}`)
}

export default function AssociationVariants({ wordId, variants, feedback, isAuthenticated }: Props) {
  const [active, setActive] = useState(0)
  const [pending, startTransition] = useTransition()
  if (variants.length === 0) return null

  const single = variants.length === 1
  const activeIdx = Math.min(active, variants.length - 1)
  const current = variants[activeIdx]
  const currentFb = feedback[current.id] ?? { up: 0, down: 0, userVote: null }

  function vote(v: boolean) {
    startTransition(() => { submitFeedbackAction(wordId, current.id, v) })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary/60">
          {single ? 'Ассоциация' : `Ассоциации (${variants.length})`}
        </p>

        {!single && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 focus:outline-none"
            >
              {activeIdx === 0 ? (
                <Star className="size-3 fill-primary text-primary" aria-label="Основной" />
              ) : (
                <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold">{activeIdx + 1}</span>
              )}
              <span className="max-w-[180px] truncate">{variantLabel(current, activeIdx)}</span>
              <ChevronDown className="size-3.5 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={6} className="min-w-[220px] py-1">
              {variants.map((v, i) => (
                <DropdownMenuItem
                  key={v.id}
                  onClick={() => setActive(i)}
                  className="cursor-pointer gap-2 px-2 py-2 text-sm"
                >
                  {i === 0 ? (
                    <Star className="size-3.5 fill-primary text-primary" />
                  ) : (
                    <span className="inline-flex size-4 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-bold">
                      {i + 1}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate">{variantLabel(v, i)}</span>
                  {i === activeIdx && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="space-y-3 rounded-2xl bg-primary/6 p-5">
        {current.image_url && (
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <ImageWithFallback
              src={current.image_url}
              alt={current.short_description ?? `Вариант ${active + 1}`}
              imgClassName="w-full object-contain"
              fallbackIconSize="size-10"
              noImageText=""
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="size-3.5 text-primary/60" />
            {!single && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-primary/60">
                {active === 0 && <Star className="size-3 fill-primary text-primary" />}
                {active === 0 ? 'Основной' : `Вариант ${active + 1}`}
              </span>
            )}
            {current.short_description && (
              <span className="text-sm font-semibold text-foreground">
                {current.short_description}
              </span>
            )}
          </div>
          <SpeakButton text={current.text} />
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{current.text}</p>

        {/* Per-variant feedback */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary/15 pt-3">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary/60">
            Эта ассоциация работает?
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => vote(true)}
              disabled={!isAuthenticated || pending}
              title={!isAuthenticated ? 'Войдите, чтобы оценить' : undefined}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                !isAuthenticated && 'cursor-not-allowed opacity-50',
                isAuthenticated && currentFb.userVote === true
                  ? 'border-green-500/40 bg-green-500/10 text-green-600'
                  : 'border-border bg-background text-muted-foreground hover:border-green-500/40 hover:bg-green-500/10 hover:text-green-600',
              )}
            >
              <ThumbsUp className="size-3.5" />
              <span className="tabular-nums">{currentFb.up}</span>
            </button>
            <button
              type="button"
              onClick={() => vote(false)}
              disabled={!isAuthenticated || pending}
              title={!isAuthenticated ? 'Войдите, чтобы оценить' : undefined}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                !isAuthenticated && 'cursor-not-allowed opacity-50',
                isAuthenticated && currentFb.userVote === false
                  ? 'border-red-500/40 bg-red-500/10 text-red-500'
                  : 'border-border bg-background text-muted-foreground hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500',
              )}
            >
              <ThumbsDown className="size-3.5" />
              <span className="tabular-nums">{currentFb.down}</span>
            </button>
          </div>
        </div>
        {!isAuthenticated && (
          <p className="text-[11px] text-muted-foreground">
            <a href="/login" className="underline underline-offset-2 hover:text-foreground">Войдите</a>, чтобы оценить ассоциацию
          </p>
        )}
      </div>
    </div>
  )
}
