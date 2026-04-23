'use client'

import { useTransition, useState, useRef } from 'react'
import { ImageOff, Upload, X } from 'lucide-react'
import { updateWordImageAction } from '@/app/actions/words'
import { Button } from '@/components/ui/button'

interface Props {
  wordId: string
  imageUrl: string | null
  wordName: string
}

export default function ImageInlineEdit({ wordId, imageUrl, wordName }: Props) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const [optimisticUrl, setOptimisticUrl] = useState(imageUrl)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function open() {
    setUrlInput('')
    setEditing(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setEditing(false)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', wordId)
      fd.set('image_file', file)
      await updateWordImageAction(fd)
    })
  }

  function saveUrl() {
    const url = urlInput.trim()
    if (!url) return
    setOptimisticUrl(url)
    setEditing(false)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', wordId)
      fd.set('image_url', url)
      await updateWordImageAction(fd)
    })
  }

  function removeImage() {
    setOptimisticUrl(null)
    setEditing(false)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', wordId)
      await updateWordImageAction(fd)
    })
  }

  if (editing) {
    return (
      <div className="flex w-48 flex-col gap-2 rounded-lg border border-border bg-background p-2.5 shadow-md">
        {optimisticUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={optimisticUrl} alt={wordName} className="h-24 w-full rounded object-cover ring-1 ring-border" />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-1.5 text-xs"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-3" />
          Загрузить файл
        </Button>

        <div className="flex gap-1">
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') saveUrl()
              if (e.key === 'Escape') setEditing(false)
            }}
            placeholder="Вставить URL"
            className="min-w-0 flex-1 rounded border border-input bg-background px-2 py-1 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50"
            autoFocus
          />
          <Button type="button" size="sm" variant="secondary" className="shrink-0 px-2.5 text-xs" onClick={saveUrl}>
            OK
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {optimisticUrl && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="flex-1 text-xs text-destructive hover:text-destructive"
              onClick={removeImage}
            >
              Удалить фото
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="ml-auto text-muted-foreground"
            onClick={() => setEditing(false)}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={open}
      disabled={pending}
      title="Изменить фото"
      className="group relative block rounded transition-opacity disabled:opacity-40"
    >
      {optimisticUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={optimisticUrl}
            alt={wordName}
            className="size-10 rounded object-cover ring-1 ring-border transition-opacity group-hover:opacity-70"
          />
          <div className="absolute inset-0 flex items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100">
            <Upload className="size-3.5 text-foreground drop-shadow" />
          </div>
        </>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive transition-colors group-hover:bg-destructive/20">
          <ImageOff className="size-3" />
          нет фото
        </span>
      )}
    </button>
  )
}
