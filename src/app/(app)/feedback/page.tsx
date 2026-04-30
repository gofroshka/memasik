import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bug, CheckCircle2, Hourglass, Lightbulb, MessageSquare, XCircle } from 'lucide-react'
import FeedbackForm from './FeedbackForm'
import { cn } from '@/lib/utils'

interface PageProps {
  searchParams: Promise<{ success?: string }>
}

const TYPE_META: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  bug:   { label: 'Ошибка',   icon: Bug,           cls: 'text-red-500 bg-red-500/10' },
  idea:  { label: 'Идея',     icon: Lightbulb,     cls: 'text-amber-600 bg-amber-500/10' },
  other: { label: 'Другое',   icon: MessageSquare, cls: 'text-muted-foreground bg-muted' },
}

const STATUS_META: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  new:         { label: 'Новое',     icon: MessageSquare, cls: 'text-blue-600 bg-blue-500/10 border-blue-500/30' },
  in_progress: { label: 'В работе',  icon: Hourglass,     cls: 'text-amber-600 bg-amber-500/10 border-amber-500/30' },
  done:        { label: 'Готово',    icon: CheckCircle2,  cls: 'text-green-600 bg-green-500/10 border-green-500/30' },
  rejected:    { label: 'Отклонено', icon: XCircle,       cls: 'text-muted-foreground bg-muted border-border' },
}

interface FeedbackEntry {
  id: string
  type: string
  status: string
  message: string
  admin_note: string | null
  created_at: string
  updated_at: string
}

export default async function FeedbackPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/feedback')

  const params = await searchParams
  const success = params.success === '1'

  const { data: rows } = await supabase
    .from('user_feedback')
    .select('id, type, status, message, admin_note, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const entries = (rows ?? []) as FeedbackEntry[]

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-extrabold">Отзывы и предложения</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Расскажите, что нравится, что нужно поправить или какую фичу хотелось бы видеть. Прочитаем каждое сообщение.
        </p>
      </div>

      {success && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/8 p-4 text-sm text-green-700">
          Спасибо! Сообщение отправлено. Если потребуется уточнить — напишем на вашу почту.{' '}
          <Link href="/feedback" className="underline underline-offset-2">Отправить ещё</Link>
        </div>
      )}

      <FeedbackForm />

      {entries.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold">Ваши обращения</h2>
          <div className="space-y-2">
            {entries.map(e => {
              const t = TYPE_META[e.type] ?? TYPE_META.other
              const s = STATUS_META[e.status] ?? STATUS_META.new
              const TypeIcon = t.icon
              const StatusIcon = s.icon
              return (
                <div key={e.id} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold', t.cls)}>
                      <TypeIcon className="size-3" />
                      {t.label}
                    </span>
                    <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-semibold', s.cls)}>
                      <StatusIcon className="size-3" />
                      {s.label}
                    </span>
                    <span className="ml-auto text-muted-foreground">
                      {new Date(e.created_at).toLocaleDateString('ru', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-foreground/90">{e.message}</p>
                  {e.admin_note && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
                      <p className="mb-1 font-bold uppercase tracking-widest text-primary/70 text-[10px]">Ответ команды</p>
                      <p className="whitespace-pre-wrap text-foreground/90">{e.admin_note}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
