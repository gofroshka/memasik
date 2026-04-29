'use client'

import { useActionState } from 'react'
import { submitSuggestionAction } from '@/app/actions/suggestions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function SuggestForm() {
  const [error, formAction, pending] = useActionState(submitSuggestionAction, null)

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="word">Слово *</Label>
            <Input id="word" name="word" required placeholder="pigeon" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="translation">Перевод *</Label>
            <Input id="translation" name="translation" required placeholder="голубь" />
          </div>
        </div>

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

        <div className="space-y-1.5">
          <Label htmlFor="association">Ассоциация *</Label>
          <Textarea
            id="association"
            name="association"
            required
            rows={4}
            placeholder="Pigeon — пиджн — звучит как «пиджак». Представляем голубя в пиджаке."
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
