'use client'

import { useState, useTransition } from 'react'
import { Bug, CheckCircle2, Hourglass, Lightbulb, MessageSquare, Trash2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { deleteFeedbackEntryAction, updateFeedbackStatusAction } from '@/app/actions/feedback-entries'

interface Entry {
  id: string
  email: string | null
  type: string
  status: string
  message: string
  admin_note: string | null
  created_at: string
  updated_at: string
}

const TYPE_META: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  bug:   { label: 'Ошибка',  icon: Bug,           cls: 'text-red-500 bg-red-500/10 border-red-500/30' },
  idea:  { label: 'Идея',    icon: Lightbulb,     cls: 'text-amber-600 bg-amber-500/10 border-amber-500/30' },
  other: { label: 'Другое',  icon: MessageSquare, cls: 'text-muted-foreground bg-muted border-border' },
}

const STATUS_OPTIONS: { value: string; label: string; icon: React.ElementType; cls: string }[] = [
  { value: 'new',         label: 'Новое',     icon: MessageSquare, cls: 'text-blue-600 border-blue-500/40 hover:bg-blue-500/8' },
  { value: 'in_progress', label: 'В работе',  icon: Hourglass,     cls: 'text-amber-600 border-amber-500/40 hover:bg-amber-500/8' },
  { value: 'done',        label: 'Готово',    icon: CheckCircle2,  cls: 'text-green-600 border-green-500/40 hover:bg-green-500/8' },
  { value: 'rejected',    label: 'Отклонено', icon: XCircle,       cls: 'text-muted-foreground border-border hover:bg-muted/40' },
]

export default function FeedbackEntryCard({ entry }: { entry: Entry }) {
  const [pending, startTransition] = useTransition()
  const [adminNote, setAdminNote] = useState(entry.admin_note ?? '')
  const t = TYPE_META[entry.type] ?? TYPE_META.other
  const TypeIcon = t.icon

  function setStatus(status: string) {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', entry.id)
      fd.set('status', status)
      fd.set('admin_note', adminNote)
      await updateFeedbackStatusAction(fd)
    })
  }

  function saveNote() {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', entry.id)
      fd.set('status', entry.status)
      fd.set('admin_note', adminNote)
      await updateFeedbackStatusAction(fd)
    })
  }

  function remove() {
    if (!confirm('Удалить сообщение? Действие необратимо.')) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', entry.id)
      await deleteFeedbackEntryAction(fd)
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold', t.cls)}>
              <TypeIcon className="size-3" />
              {t.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(entry.created_at).toLocaleString('ru', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {entry.email && (
            <p className="text-xs text-muted-foreground truncate">{entry.email}</p>
          )}
        </div>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={remove}
          disabled={pending}
          className="text-muted-foreground hover:text-destructive shrink-0"
          title="Удалить"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
        {entry.message}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Заметка / ответ команды
        </label>
        <Textarea
          rows={2}
          value={adminNote}
          onChange={e => setAdminNote(e.target.value)}
          placeholder="Видно пользователю в его истории обращений…"
        />
        {adminNote !== (entry.admin_note ?? '') && (
          <Button type="button" size="sm" variant="outline" onClick={saveNote} disabled={pending}>
            Сохранить заметку
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Статус:</span>
        {STATUS_OPTIONS.map(opt => {
          const Icon = opt.icon
          const active = entry.status === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              disabled={pending || active}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                active
                  ? 'bg-foreground text-background border-foreground cursor-default'
                  : opt.cls,
              )}
            >
              <Icon className="size-3" />
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
