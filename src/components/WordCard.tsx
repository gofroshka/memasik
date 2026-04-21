import Link from 'next/link'
import { Brain, Languages } from 'lucide-react'
import { Word } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function WordCard({ word }: { word: Word }) {
  const hint = word.short_description

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
          {word.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={word.image_url}
              alt={word.word}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/8 to-secondary">
              <Brain className="size-8 text-primary/20" />
            </div>
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
