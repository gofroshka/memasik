import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, Eye, FileText, Languages } from 'lucide-react'
import AssociationVariants from './AssociationVariants'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import FeedbackButtons from '@/components/FeedbackButtons'
import SpeakButton from '@/components/SpeakButton'
import ImageWithFallback from '@/components/ImageWithFallback'
import { getWordById, getAdjacentWords } from '@/lib/repository/words'

interface WordPageProps {
  params: Promise<{ id: string }>
}

export default async function WordPage({ params }: WordPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const word = await getWordById(supabase, id)
  if (!word) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  // Track view (fire-and-forget)
  supabase.from('word_views').insert({ word_id: id, user_id: user?.id ?? null }).then(() => {})

  const [{ prev, next }, { data: feedbackRows }, { count: viewCount }] = await Promise.all([
    getAdjacentWords(supabase, word.word),
    supabase.from('word_feedback').select('vote, user_id').eq('word_id', id),
    supabase.from('word_views').select('*', { count: 'exact', head: true }).eq('word_id', id),
  ])

  const upCount = feedbackRows?.filter(f => f.vote === true).length ?? 0
  const downCount = feedbackRows?.filter(f => f.vote === false).length ?? 0
  const userVote = user ? (feedbackRows?.find(f => f.user_id === user.id)?.vote ?? null) : null

  const backHref = word.category
    ? `/learn?category=${encodeURIComponent(word.category)}`
    : '/learn'

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">

      {/* ─── Navigation bar ─── */}
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5 px-2 text-muted-foreground')}
        >
          <ArrowLeft className="size-3.5" />
          {word.category ?? 'Библиотека'}
        </Link>

        <div className="flex items-center gap-1">
          {prev ? (
            <Link
              href={`/words/${prev.id}`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1 text-xs')}
              title={prev.word}
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden max-w-[72px] truncate sm:inline">{prev.word}</span>
            </Link>
          ) : (
            <div className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'pointer-events-none opacity-30')}>
              <ArrowLeft className="size-3.5" />
            </div>
          )}
          {next ? (
            <Link
              href={`/words/${next.id}`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1 text-xs')}
              title={next.word}
            >
              <span className="hidden max-w-[72px] truncate sm:inline">{next.word}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          ) : (
            <div className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'pointer-events-none opacity-30')}>
              <ArrowRight className="size-3.5" />
            </div>
          )}
        </div>
      </div>

      {/* ─── Word card ─── */}
      <Card className="gap-0 overflow-hidden p-0">
        {/* Image */}
        <div className="relative overflow-hidden bg-muted">
          <ImageWithFallback
            src={word.image_url}
            alt={`Ассоциация для слова ${word.word}`}
            imgClassName="w-full object-contain"
            fallbackIconSize="size-12"
            noImageText="Изображение не добавлено"
          />
        </div>

        {/* Content */}
        <CardContent className="space-y-5 p-6 md:p-8">
          {/* Word + translation */}
          <div className="space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
              Word card
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-4xl font-extrabold md:text-5xl">{word.word}</h1>
              {word.transcription && (
                <span className="text-xl font-normal text-muted-foreground">[{word.transcription}]</span>
              )}
              <SpeakButton text={word.word} lang="en-US" label="Озвучить слово" />
              {(viewCount ?? 0) > 0 && (
                <span className="flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                  <Eye className="size-3" /> {viewCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-lg font-bold text-primary">
              <Languages className="size-5" />
              {word.translation}
            </div>
          </div>

          {/* Short description */}
          {word.short_description && (
            <p className="text-base leading-relaxed text-muted-foreground">{word.short_description}</p>
          )}

          {/* Textbook reference */}
          {(word.textbook_class || word.textbook_page) && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
              <BookOpen className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">Rainbow English</span>
              {word.textbook_class && (
                <span className="font-semibold text-foreground">{word.textbook_class} класс</span>
              )}
              {word.textbook_part && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">ч. <span className="font-semibold text-foreground">{word.textbook_part}</span></span>
                </>
              )}
              {word.textbook_page && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">стр. <span className="font-semibold text-foreground">{word.textbook_page}</span></span>
                </>
              )}
            </div>
          )}

          {/* Associations (multiple — with per-variant image) */}
          {word.associations && word.associations.length > 0 ? (
            <AssociationVariants variants={word.associations} />
          ) : word.description ? (
            <div className="rounded-2xl bg-primary/6 p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="size-3.5 text-primary/60" />
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary/60">
                    Полный разбор
                  </p>
                </div>
                <SpeakButton text={word.description} />
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{word.description}</p>
            </div>
          ) : null}

          {/* Feedback */}
          <div className="rounded-2xl border border-border p-5">
            <FeedbackButtons
              wordId={word.id}
              upCount={upCount}
              downCount={downCount}
              userVote={userVote}
              isAuthenticated={!!user}
            />
          </div>

          {/* Usage tips */}
          <div className="rounded-2xl border border-border p-4">
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
              Как запомнить
            </p>
            <ol className="space-y-2">
              {[
                'Посмотрите на образ и скажите слово вслух.',
                'Прочитайте ассоциацию — пусть в голове появится картинка.',
                'Закройте карточку и попробуйте вспомнить перевод.',
                'Вернитесь завтра — и слово останется навсегда.',
              ].map((tip, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-muted-foreground">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-bold">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
