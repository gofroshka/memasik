import { createClient } from '@/lib/supabase/server'
import { deleteSuggestionAction, updateSuggestionStatusAction } from '@/app/actions/suggestions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { parseSection, sectionMeta, SECTIONS, withSection } from '@/lib/sections'
import { cn } from '@/lib/utils'

const statusLabel: Record<string, string> = {
  pending: 'На проверке',
  approved: 'Одобрено',
  rejected: 'Отклонено',
}

const statusVariant: Record<string, 'secondary' | 'outline' | 'destructive'> = {
  pending: 'secondary',
  approved: 'outline',
  rejected: 'destructive',
}

interface AdminSuggestionsPageProps {
  searchParams: Promise<{ section?: string }>
}

export default async function AdminSuggestionsPage({ searchParams }: AdminSuggestionsPageProps) {
  const params = await searchParams
  const section = parseSection(params.section)
  const meta = sectionMeta(section)
  const supabase = await createClient()

  const { data: suggestions } = await supabase
    .from('user_suggestions')
    .select('*, profiles!user_suggestions_profile_fk(full_name)')
    .eq('section', section)
    .order('created_at', { ascending: false })

  const pending = suggestions?.filter(s => s.status === 'pending').length ?? 0

  return (
    <div className="space-y-6">
      <div className="inline-flex overflow-hidden rounded-full border border-border">
        {SECTIONS.map(s => (
          <Link
            key={s.id}
            href={withSection('/admin/suggestions', s.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-1.5 text-sm transition-colors',
              s.id === section
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              s.id !== SECTIONS[0].id && 'border-l border-border'
            )}
          >
            <span>{s.emoji}</span>
            <span>{s.title}</span>
          </Link>
        ))}
      </div>

      <div>
        <h1 className="text-2xl font-bold">Предложения · {meta.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pending > 0 ? `${pending} ожидают проверки` : 'Нет новых предложений'}
        </p>
      </div>

      {suggestions && suggestions.length > 0 ? (
        <div className="space-y-3">
          {suggestions.map(s => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-extrabold">{s.word}</span>
                    <span className="text-muted-foreground">—</span>
                    <span className="font-semibold">{s.translation}</span>
                    {s.transcription && (
                      <span className="text-xs text-muted-foreground">[{s.transcription}]</span>
                    )}
                  </div>
                  {s.profiles && (
                    <p className="text-xs text-muted-foreground">
                      от {(s.profiles as { full_name: string | null }).full_name ?? 'пользователя'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={statusVariant[s.status]}>{statusLabel[s.status]}</Badge>
                  <form action={deleteSuggestionAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <Button type="submit" size="icon-sm" variant="ghost" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </form>
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground/90">
                {s.association}
              </div>

              {s.status === 'pending' && (
                <div className="flex items-center gap-2 pt-1">
                  <form action={updateSuggestionStatusAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="status" value="approved" />
                    <Button type="submit" size="sm" variant="outline" className="gap-1.5 text-green-600 border-green-500/30 hover:bg-green-500/8 hover:text-green-600">
                      <Check className="size-3.5" />
                      Одобрить
                    </Button>
                  </form>
                  <form action={updateSuggestionStatusAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <Button type="submit" size="sm" variant="outline" className="gap-1.5 text-red-500 border-red-500/30 hover:bg-red-500/8 hover:text-red-500">
                      <X className="size-3.5" />
                      Отклонить
                    </Button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <p className="font-semibold">Предложений пока нет</p>
          <p className="mt-1 text-sm text-muted-foreground">Пользователи ещё не отправляли ассоциации</p>
        </div>
      )}
    </div>
  )
}
