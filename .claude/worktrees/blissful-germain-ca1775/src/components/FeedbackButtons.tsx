'use client'

import { useTransition } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { submitFeedbackAction } from '@/app/actions/feedback'
import { cn } from '@/lib/utils'

interface FeedbackButtonsProps {
  wordId: string
  upCount: number
  downCount: number
  userVote: boolean | null
  isAuthenticated: boolean
}

export default function FeedbackButtons({ wordId, upCount, downCount, userVote, isAuthenticated }: FeedbackButtonsProps) {
  const [pending, startTransition] = useTransition()

  function vote(v: boolean) {
    startTransition(() => { submitFeedbackAction(wordId, v) })
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
        Ассоциация работает?
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => vote(true)}
          disabled={!isAuthenticated || pending}
          title={!isAuthenticated ? 'Войдите, чтобы оценить' : undefined}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all',
            !isAuthenticated && 'cursor-not-allowed opacity-50',
            isAuthenticated && userVote === true
              ? 'border-green-500/40 bg-green-500/10 text-green-600'
              : isAuthenticated
                ? 'border-border bg-card text-muted-foreground hover:border-green-500/40 hover:bg-green-500/8 hover:text-green-600'
                : 'border-border bg-card text-muted-foreground'
          )}
        >
          <ThumbsUp className="size-4" />
          <span>{upCount}</span>
        </button>

        <button
          onClick={() => vote(false)}
          disabled={!isAuthenticated || pending}
          title={!isAuthenticated ? 'Войдите, чтобы оценить' : undefined}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all',
            !isAuthenticated && 'cursor-not-allowed opacity-50',
            isAuthenticated && userVote === false
              ? 'border-red-500/40 bg-red-500/10 text-red-500'
              : isAuthenticated
                ? 'border-border bg-card text-muted-foreground hover:border-red-500/40 hover:bg-red-500/8 hover:text-red-500'
                : 'border-border bg-card text-muted-foreground'
          )}
        >
          <ThumbsDown className="size-4" />
          <span>{downCount}</span>
        </button>
      </div>
      {!isAuthenticated && (
        <p className="text-xs text-muted-foreground">
          <a href="/login" className="underline underline-offset-2 hover:text-foreground">Войдите</a>, чтобы оценить ассоциацию
        </p>
      )}
    </div>
  )
}
