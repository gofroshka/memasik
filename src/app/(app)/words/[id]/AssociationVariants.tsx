'use client'

import { useState } from 'react'
import { FileText, Star } from 'lucide-react'
import { AssociationVariant } from '@/lib/types'
import { cn } from '@/lib/utils'
import SpeakButton from '@/components/SpeakButton'
import ImageWithFallback from '@/components/ImageWithFallback'

interface Props {
  variants: AssociationVariant[]
}

export default function AssociationVariants({ variants }: Props) {
  const [active, setActive] = useState(0)
  if (variants.length === 0) return null

  const single = variants.length === 1
  const current = variants[Math.min(active, variants.length - 1)]

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary/60">
        {single ? 'Ассоциация' : `Ассоциации (${variants.length})`}
      </p>

      {!single && (
        <div className="flex flex-wrap gap-1.5">
          {variants.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors',
                i === active
                  ? 'border-primary/40 bg-primary/10 font-semibold text-primary'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              {i === 0 ? (
                <Star className="size-3 fill-primary text-primary" aria-label="Основной" />
              ) : (
                <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-bold">{i + 1}</span>
              )}
              <span className="max-w-[180px] truncate">
                {v.short_description?.trim() || (i === 0 ? 'Основной' : `Вариант ${i + 1}`)}
              </span>
            </button>
          ))}
        </div>
      )}

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
      </div>
    </div>
  )
}
