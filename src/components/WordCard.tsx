import Link from 'next/link'
import { Languages } from 'lucide-react'
import { Word } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import ImageWithFallback from '@/components/ImageWithFallback'

export default function WordCard({ word }: { word: Word }) {
  const hint = word.short_description
  const extraVariants = Math.max(0, (word.associations?.length ?? 0) - 1)

  return (
    <Link href={`/words/${word.id}`} className="group block">
      <Card
        className={cn(
          'gap-0 overflow-hidden p-0',
          'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md'
        )}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <ImageWithFallback
            src={word.image_url}
            alt={word.word}
            imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {extraVariants > 0 && (
            <span
              aria-label={`Ещё ${extraVariants} вариантов ассоциации`}
              title={`+${extraVariants} вариант${extraVariants === 1 ? '' : extraVariants < 5 ? 'а' : 'ов'} ассоциации`}
              className="absolute right-2 top-2 inline-flex min-w-[22px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-none text-primary-foreground shadow ring-2 ring-background/80"
              style={{ height: 22 }}
            >
              +{extraVariants}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-base font-extrabold leading-tight">{word.word}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Languages className="size-3.5 shrink-0" />
            <span className="truncate font-semibold">{word.translation}</span>
          </div>
          {hint && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {hint}
            </p>
          )}
        </div>
      </Card>
    </Link>
  )
}
