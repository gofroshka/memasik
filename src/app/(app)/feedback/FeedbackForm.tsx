'use client'

import { useActionState, useState } from 'react'
import { Bug, Lightbulb, MessageSquare } from 'lucide-react'
import { submitFeedbackEntryAction } from '@/app/actions/feedback-entries'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type FeedbackType = 'bug' | 'idea' | 'other'

const TYPE_OPTIONS: { value: FeedbackType; label: string; icon: React.ElementType; hint: string }[] = [
  { value: 'idea',  label: 'Идея',     icon: Lightbulb,     hint: 'Что хочется добавить или улучшить' },
  { value: 'bug',   label: 'Ошибка',   icon: Bug,           hint: 'Что-то не работает или ведёт себя странно' },
  { value: 'other', label: 'Другое',   icon: MessageSquare, hint: 'Просто хотите написать — пишите' },
]

export default function FeedbackForm() {
  const [error, formAction, pending] = useActionState(submitFeedbackEntryAction, null)
  const [type, setType] = useState<FeedbackType>('idea')

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="type" value={type} />

      <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <Label>Тип</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TYPE_OPTIONS.map(opt => {
            const Icon = opt.icon
            const active = type === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={cn(
                  'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors',
                  active
                    ? 'border-primary bg-primary/8 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                )}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Icon className="size-3.5" />
                  {opt.label}
                </div>
                <p className={cn('text-[11px] leading-snug', active ? 'text-primary/80' : 'text-muted-foreground')}>
                  {opt.hint}
                </p>
              </button>
            )
          })}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="message">Сообщение *</Label>
          <Textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder={
              type === 'bug'
                ? 'Что произошло, что вы ожидали увидеть, на каком устройстве / в каком браузере…'
                : type === 'idea'
                  ? 'Расскажите идею: что хочется, как должно работать, кому это поможет.'
                  : 'Напишите всё, что хотите сказать.'
            }
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-xs text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Отправляем...' : 'Отправить'}
      </Button>
    </form>
  )
}
