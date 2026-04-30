'use client'

import { useActionState } from 'react'
import { submitSuggestionAction } from '@/app/actions/suggestions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { SectionId, SectionMeta } from '@/lib/sections'

interface Props {
  section: SectionId
  meta: SectionMeta
}

export default function SuggestForm({ section, meta }: Props) {
  const [error, formAction, pending] = useActionState(submitSuggestionAction, null)
  const isRussian = section === 'russian'

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="section" value={section} />
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="word">{meta.wordLabel} *</Label>
            <Input id="word" name="word" required placeholder={meta.wordPlaceholder} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="translation">{meta.translationLabel} *</Label>
            <Input id="translation" name="translation" required placeholder={meta.translationPlaceholder} />
          </div>
        </div>

        {!isRussian && (
          <div className="space-y-1.5">
            <Label htmlFor="transcription">Транскрипция на русском *</Label>
            <Input
              id="transcription"
              name="transcription"
              required
              placeholder="пиджн"
            />
            <p className="text-xs text-muted-foreground">
              Напишите, как слово звучит по-русски, например: «пиджн», «лафтэ»
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="association">Ассоциация *</Label>
          <Textarea
            id="association"
            name="association"
            required
            rows={4}
            placeholder={isRussian
              ? 'Корова говорит «му», но в слове две «о». Представь, как корова мычит «о-о».'
              : 'Pigeon — пиджн — звучит как «пиджак». Представляем голубя в пиджаке.'}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-xs text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Отправляем...' : 'Отправить предложение'}
      </Button>
    </form>
  )
}
