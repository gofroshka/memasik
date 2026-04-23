'use client'

import { useTransition, useState, useRef } from 'react'
import { updateTextbookFieldsAction } from '@/app/actions/words'

interface Props {
  wordId: string
  textbookClass: number | null
  textbookPart: number | null
  textbookPage: number | null
}

export default function TextbookInlineEdit({ wordId, textbookClass, textbookPart, textbookPage }: Props) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const [cls, setCls] = useState(textbookClass?.toString() ?? '')
  const [part, setPart] = useState(textbookPart?.toString() ?? '')
  const [page, setPage] = useState(textbookPage?.toString() ?? '')
  const clsRef = useRef<HTMLInputElement>(null)

  const isEmpty = !cls && !part && !page

  function startEditing() {
    setEditing(true)
    setTimeout(() => clsRef.current?.focus(), 0)
  }

  function save() {
    setEditing(false)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', wordId)
      fd.set('textbook_class', cls)
      fd.set('textbook_part', part)
      fd.set('textbook_page', page)
      await updateTextbookFieldsAction(fd)
    })
  }

  function handleContainerBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (e.currentTarget.contains(e.relatedTarget)) return
    save()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') {
      setCls(textbookClass?.toString() ?? '')
      setPart(textbookPart?.toString() ?? '')
      setPage(textbookPage?.toString() ?? '')
      setEditing(false)
    }
  }

  if (!editing) {
    return (
      <button
        onClick={startEditing}
        disabled={pending}
        className="group flex items-center gap-1 rounded px-1.5 py-1 text-xs transition-colors hover:bg-muted disabled:opacity-50"
      >
        {isEmpty ? (
          <span className="text-muted-foreground/30 group-hover:text-muted-foreground/60">—</span>
        ) : (
          <span className="font-mono text-muted-foreground">
            {[cls && `${cls}кл`, part && `${part}ч`, page && `с.${page}`].filter(Boolean).join(' · ')}
          </span>
        )}
      </button>
    )
  }

  const inputCls =
    'w-10 rounded border border-input bg-background px-1 py-0.5 text-center text-xs focus:outline-none focus:ring-2 focus:ring-ring/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

  return (
    <div
      className="flex items-end gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5 shadow-sm"
      onBlur={handleContainerBlur}
      onKeyDown={handleKeyDown}
    >
      <label className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] text-muted-foreground">кл</span>
        <input
          ref={clsRef}
          type="number"
          value={cls}
          onChange={e => setCls(e.target.value)}
          className={inputCls}
          min={1}
          max={11}
        />
      </label>
      <label className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] text-muted-foreground">часть</span>
        <input
          type="number"
          value={part}
          onChange={e => setPart(e.target.value)}
          className={inputCls}
          min={1}
        />
      </label>
      <label className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] text-muted-foreground">стр</span>
        <input
          type="number"
          value={page}
          onChange={e => setPage(e.target.value)}
          className="w-12 rounded border border-input bg-background px-1 py-0.5 text-center text-xs focus:outline-none focus:ring-2 focus:ring-ring/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          min={1}
        />
      </label>
    </div>
  )
}
