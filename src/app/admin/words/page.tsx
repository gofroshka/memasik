import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Check, Eye, EyeOff, Pencil, Plus, ThumbsDown, ThumbsUp } from 'lucide-react'
import DeleteWordButton from './DeleteWordButton'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { togglePublishAction } from '@/app/actions/words'
import { cn } from '@/lib/utils'

export default async function AdminWordsPage() {
  const supabase = await createClient()
  const [{ data: words }, { data: feedback }] = await Promise.all([
    supabase.from('words').select('*').order('created_at', { ascending: false }),
    supabase.from('word_feedback').select('word_id, vote'),
  ])

  function getVotes(wordId: string) {
    const rows = feedback?.filter(f => f.word_id === wordId) ?? []
    return {
      up: rows.filter(f => f.vote === true).length,
      down: rows.filter(f => f.vote === false).length,
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Слова и ассоциации</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Библиотека мнемо-карточек — {words?.length ?? 0} записей
          </p>
        </div>
        <Link href="/admin/words/new" className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}>
          <Plus className="size-3.5" />
          Добавить слово
        </Link>
      </div>

      {words && words.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground">Слово</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground">Перевод</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground">Категория</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground">Картинка</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground">Отзывы</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground">Статус</th>
                  <th className="px-5 py-3.5 text-right text-xs font-medium text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {words.map(word => (
                  <tr key={word.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-5 py-4 font-medium">{word.word}</td>
                    <td className="px-5 py-4 text-muted-foreground">{word.translation}</td>
                    <td className="px-5 py-4">
                      {word.category ? (
                        <Badge variant="secondary">{word.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {word.image_url ? (
                        <Check className="size-4 text-primary" />
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {(() => {
                        const v = getVotes(word.id)
                        return (
                          <div className="flex items-center gap-2.5 text-xs">
                            <span className="flex items-center gap-1 text-green-600">
                              <ThumbsUp className="size-3" />
                              {v.up}
                            </span>
                            <span className="flex items-center gap-1 text-red-500">
                              <ThumbsDown className="size-3" />
                              {v.down}
                            </span>
                          </div>
                        )
                      })()}
                    </td>
                    <td className="px-5 py-4">
                      <form action={togglePublishAction}>
                        <input type="hidden" name="id" value={word.id} />
                        <input type="hidden" name="is_published" value={String(word.is_published)} />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          className={cn(
                            'gap-1.5 text-xs',
                            word.is_published
                              ? 'text-green-600 border-green-500/30'
                              : 'text-muted-foreground'
                          )}
                        >
                          {word.is_published
                            ? <><Eye className="size-3" /> Опубликовано</>
                            : <><EyeOff className="size-3" /> Черновик</>
                          }
                        </Button>
                      </form>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/words/${word.id}/edit`}
                          className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }))}
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <DeleteWordButton wordId={word.id} wordName={word.word} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-2 md:hidden">
            {words.map(word => {
              const v = getVotes(word.id)
              return (
                <div
                  key={word.id}
                  className="rounded-lg border border-border bg-card p-3 shadow-sm space-y-2"
                >
                  <div className="flex items-center gap-3">
                    {word.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={word.image_url}
                        alt={word.word}
                        className="size-12 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted text-lg">
                        🧠
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-tight">{word.word}</p>
                      <p className="text-xs text-muted-foreground">{word.translation}</p>
                      {word.category && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {word.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                    <div className="flex items-center gap-3">
                      <form action={togglePublishAction}>
                        <input type="hidden" name="id" value={word.id} />
                        <input type="hidden" name="is_published" value={String(word.is_published)} />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          className={cn(
                            'gap-1.5 text-xs',
                            word.is_published
                              ? 'text-green-600 border-green-500/30'
                              : 'text-muted-foreground'
                          )}
                        >
                          {word.is_published
                            ? <><Eye className="size-3" /> Опубликовано</>
                            : <><EyeOff className="size-3" /> Черновик</>
                          }
                        </Button>
                      </form>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5 text-green-600">
                          <ThumbsUp className="size-3" />{v.up}
                        </span>
                        <span className="flex items-center gap-0.5 text-red-500">
                          <ThumbsDown className="size-3" />{v.down}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        href={`/admin/words/${word.id}/edit`}
                        className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }))}
                      >
                        <Pencil className="size-3.5" />
                      </Link>
                      <DeleteWordButton wordId={word.id} wordName={word.word} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card py-16 text-center shadow-sm">
          <h3 className="font-semibold">Слов ещё нет</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Добавьте первую карточку, чтобы заполнить библиотеку.
          </p>
          <Link href="/admin/words/new" className={cn(buttonVariants({ size: 'sm' }), 'mt-4 gap-1.5')}>
            <Plus className="size-3.5" />
            Добавить слово
          </Link>
        </div>
      )}
    </div>
  )
}
