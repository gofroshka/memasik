'use client'

import { useTransition, useState, useRef } from 'react'
import { patchWordAction } from '@/app/actions/words'

interface Props {
  wordId: string
  field: 'word' | 'translation' | 'category' | 'transcription'
  value: string | null
  placeholder?: string
  inputClassName?: string
}

export default function InlineCellEdit({ wordId, field, value, placeholder, inputClassName }: Props) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const [localValue, setLocalValue] = useState(value ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  function startEditing() {
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') {
      setLocalValue(value ?? '')
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`rounded border border-input bg-background px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 ${inputClassName ?? 'w-36'}`}
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
        <span>{localValue}</span>
      ) : (
        <span className="text-muted-foreground/30 group-hover:text-muted-foreground/60">—</span>
      )}
    </button>
  )
}
