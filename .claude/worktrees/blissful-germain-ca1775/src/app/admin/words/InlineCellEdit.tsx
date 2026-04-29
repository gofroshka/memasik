'use client'

import { useTransition, useState, useRef } from 'react'
import { patchWordAction } from '@/app/actions/words'

interface Props {
  wordId: string
  field: 'word' | 'translation' | 'description' | 'category' | 'transcription' | 'short_description' | 'full_analysis'
  value: string | null
  placeholder?: string
  inputClassName?: string
  multiline?: boolean
}

export default function InlineCellEdit({ wordId, field, value, placeholder, inputClassName, multiline }: Props) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const [localValue, setLocalValue] = useState(value ?? '')
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  function startEditing() {
    setEditing(true)
    setTimeout(() => ref.current?.focus(), 0)
  }

  function save() {
    setEditing(false)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', wordId)
      fd.set('field', field)
      fd.set('value', localValue)
      await patchWordAction(fd)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setLocalValue(value ?? '')
      setEditing(false)
    }
    if (e.key === 'Enter' && !multiline) save()
    if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) save()
  }

  const baseCls = 'rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50'

  if (editing) {
    return multiline ? (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={6}
        className={`${baseCls} resize-y ${inputClassName ?? 'w-48'}`}
      />
    ) : (
      <input
        ref={ref as React.RefObject<HTMLInputElement>}
        type="text"
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${baseCls} ${inputClassName ?? 'w-36'}`}
      />
    )
  }

  return (
    <button
      onClick={startEditing}
      disabled={pending}
      className="group min-w-[2rem] rounded px-1.5 py-1 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50"
    >
      {localValue ? (
        multiline ? (
          <span className="line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed">{localValue}</span>
        ) : (
          <span>{localValue}</span>
        )
      ) : (
        <span className="text-muted-foreground/30 group-hover:text-muted-foreground/60">—</span>
      )}
    </button>
  )
}
