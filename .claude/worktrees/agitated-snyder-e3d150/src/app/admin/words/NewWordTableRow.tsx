'use client'

import { useTransition, useState, useEffect, useRef } from 'react'
import { Check, X } from 'lucide-react'
import { createWordInlineAction } from '@/app/actions/words'
import { Button } from '@/components/ui/button'

interface Props {
  onCancel: () => void
}

const inputCls = 'w-full rounded border border-input bg-background px-2 py-1 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/50'
const numCls = 'w-10 rounded border border-input bg-background px-1 py-1 text-center text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none'

export default function NewWordTableRow({ onCancel }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const wordRef = useRef<HTMLInputElement>(null)

  const [word, setWord] = useState('')
  const [translation, setTranslation] = useState('')
  const [category, setCategory] = useState('')
  const [transcription, setTranscription] = useState('')
  const [cls, setCls] = useState('')
  const [part, setPart] = useState('')
  const [page, setPage] = useState('')

  useEffect(() => {
    wordRef.current?.focus()
  }, [])

  function save() {
    if (!word.trim() || !translation.trim()) {
      setError('Заполните слово и перевод')
      return
    }
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('word', word.trim())
      fd.set('translation', translation.trim())
      if (category.trim()) fd.set('category', category.trim())
      if (transcription.trim()) fd.set('transcription', transcription.trim())
      if (cls.trim()) fd.set('textbook_class', cls.trim())
      if (part.trim()) fd.set('textbook_part', part.trim())
      if (page.trim()) fd.set('textbook_page', page.trim())
      const err = await createWordInlineAction(fd)
      if (err) {
        setError(err)
      } else {
        onCancel()
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onCancel()
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save()
  }

  const td = 'px-3 py-2 align-middle'

  return (
    <tr className="bg-primary/5 outline outline-1 outline-primary/20" onKeyDown={handleKeyDown}>
      <td className={td}>
        <div className="flex flex-col gap-1">
          <input
            ref={wordRef}
            type="text"
            value={word}
            onChange={e => setWord(e.target.value)}
            placeholder="Слово *"
            className={inputCls}
            disabled={pending}
          />
          {error && <span className="text-[10px] text-destructive">{error}</span>}
        </div>
      </td>
      <td className={td}>
        <input
          type="text"
          value={translation}
          onChange={e => setTranslation(e.target.value)}
          placeholder="Перевод *"
          className={inputCls}
          disabled={pending}
        />
      </td>
      <td className={td}>
        <input
          type="text"
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="—"
          className={inputCls}
          disabled={pending}
        />
      </td>
      <td className={td}>
        <input
          type="text"
          value={transcription}
          onChange={e => setTranscription(e.target.value)}
          placeholder="—"
          className={inputCls}
          disabled={pending}
        />
      </td>
      <td className={td}>
        <div className="flex items-center gap-1">
          <input type="number" value={cls} onChange={e => setCls(e.target.value)} placeholder="кл" className={numCls} min={1} max={11} disabled={pending} />
          <span className="text-muted-foreground/40 text-xs">·</span>
          <input type="number" value={part} onChange={e => setPart(e.target.value)} placeholder="ч" className={numCls} min={1} disabled={pending} />
          <span className="text-muted-foreground/40 text-xs">·</span>
          <input type="number" value={page} onChange={e => setPage(e.target.value)} placeholder="стр" className="w-12 rounded border border-input bg-background px-1 py-1 text-center text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" min={1} disabled={pending} />
        </div>
      </td>
      <td className={td}>
        <span className="text-xs text-muted-foreground/40">—</span>
      </td>
      <td className={td}>
        <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
          Черновик
        </span>
      </td>
      <td className={`${td} text-right`}>
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="default"
            onClick={save}
            disabled={pending}
            title="Сохранить (Ctrl+Enter)"
          >
            <Check className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={onCancel}
            disabled={pending}
            className="text-muted-foreground"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
