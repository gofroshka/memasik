'use client'

import Link from 'next/link'
import { Eye, EyeOff, ImageOff, Pencil } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { togglePublishAction } from '@/app/actions/words'
import { cn } from '@/lib/utils'
import { Word } from '@/lib/types'
import DeleteWordButton from './DeleteWordButton'

interface Props {
  words: Word[]
}

export default function WordsListView({ words }: Props) {
  return (
    <div className="space-y-2">
      {words.map(word => (
        <div
          key={word.id}
          className="rounded-xl border border-border bg-card shadow-sm transition-colors hover:bg-muted/20"
        >
          {/* Top row: image + info */}
          <div className="flex items-center gap-3 px-4 pt-3 pb-2.5">
            <div className="shrink-0">
              {word.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={word.image_url}
                  alt={word.word}
                  className="size-11 rounded-lg object-cover ring-1 ring-border"
                />
              ) : (
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
                  <ImageOff className="size-4 text-muted-foreground/30" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-semibold">{word.word}</span>
                <span className="text-sm text-muted-foreground">{word.translation}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {word.category && (
                  <Badge variant="secondary" className="text-xs">{word.category}</Badge>
                )}
                {!word.image_url && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
                    <ImageOff className="size-3" />
                    нет фото
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom row: actions */}
          <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
            <form action={togglePublishAction}>
              <input type="hidden" name="id" value={word.id} />
              <input type="hidden" name="is_published" value={String(word.is_published)} />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className={cn(
                  'gap-1.5 text-xs',
                  word.is_published ? 'border-green-500/30 text-green-600' : 'text-muted-foreground'
                )}
              >
                {word.is_published
                  ? <><Eye className="size-3" /> Опубликовано</>
                  : <><EyeOff className="size-3" /> Черновик</>
                }
              </Button>
            </form>

            <div className="flex items-center gap-1.5">
              <Link
                href={`/admin/words/${word.id}/edit`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5 text-xs')}
              >
                <Pencil className="size-3" />
                Редактировать
              </Link>
              <DeleteWordButton wordId={word.id} wordName={word.word} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
