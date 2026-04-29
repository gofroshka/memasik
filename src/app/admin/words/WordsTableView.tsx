'use client'

import { useRef, useState } from 'react'
import { Eye, EyeOff, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { togglePublishAction } from '@/app/actions/words'
import { cn } from '@/lib/utils'
import { Word } from '@/lib/types'
import InlineCellEdit from './InlineCellEdit'
import TextbookInlineEdit from './TextbookInlineEdit'
import ImageInlineEdit from './ImageInlineEdit'
import DeleteWordButton from './DeleteWordButton'
import NewWordTableRow from './NewWordTableRow'

interface Props {
  words: Word[]
  adding: boolean
  onAddingChange: (v: boolean) => void
}

export type WordsColumnId =
  | 'word'
  | 'translation'
  | 'category'
  | 'transcription'
  | 'description'
  | 'short_description'
  | 'textbook'
  | 'image'
  | 'status'
  | 'delete'

export interface WordsColumn {
  id: WordsColumnId
  label: string
  minWidth: number
  alignRight?: boolean
}

const DEFAULT_COLUMNS: WordsColumn[] = [
  { id: 'word', label: 'Слово', minWidth: 140 },
  { id: 'translation', label: 'Перевод', minWidth: 160 },
  { id: 'category', label: 'Категория', minWidth: 130 },
  { id: 'transcription', label: 'Транскрипция', minWidth: 140 },
  { id: 'description', label: 'Описание', minWidth: 200 },
  { id: 'short_description', label: 'Короткое описание', minWidth: 180 },
  { id: 'textbook', label: 'Учебник', minWidth: 160 },
  { id: 'image', label: 'Фото', minWidth: 100 },
  { id: 'status', label: 'Статус', minWidth: 140 },
  { id: 'delete', label: 'Удалить', minWidth: 60, alignRight: true },
]

const STORAGE_KEY = 'words-columns'

const th = 'px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap select-none'
const td = 'px-4 py-3 align-top'

export default function WordsTableView({ words, adding, onAddingChange }: Props) {
  const [columns, setColumns] = useState<WordsColumn[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as WordsColumnId[]
          const ordered = parsed
            .map(id => DEFAULT_COLUMNS.find(c => c.id === id))
            .filter(Boolean) as WordsColumn[]
          DEFAULT_COLUMNS.forEach(c => {
            if (!ordered.find(o => o.id === c.id)) ordered.push(c)
          })
          return ordered
        }
      } catch {}
    }
    return DEFAULT_COLUMNS
  })

  const dragColRef = useRef<WordsColumnId | null>(null)
  const dragOverColRef = useRef<WordsColumnId | null>(null)

  function saveColumnOrder(cols: WordsColumn[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cols.map(c => c.id)))
    } catch {}
  }

  function handleDragStart(colId: WordsColumnId) {
    dragColRef.current = colId
  }

  function handleDragOver(e: React.DragEvent, colId: WordsColumnId) {
    e.preventDefault()
    dragOverColRef.current = colId
  }

  function handleDrop() {
    if (!dragColRef.current || !dragOverColRef.current) return
    if (dragColRef.current === dragOverColRef.current) return

    const newCols = [...columns]
    const fromIdx = newCols.findIndex(c => c.id === dragColRef.current)
    const toIdx = newCols.findIndex(c => c.id === dragOverColRef.current)
    const [moved] = newCols.splice(fromIdx, 1)
    newCols.splice(toIdx, 0, moved)

    setColumns(newCols)
    saveColumnOrder(newCols)
    dragColRef.current = null
    dragOverColRef.current = null
  }

  function renderCell(col: WordsColumn, word: Word) {
    switch (col.id) {
      case 'word':
        return <InlineCellEdit wordId={word.id} field="word" value={word.word} inputClassName="w-[130px]" />
      case 'translation':
        return <InlineCellEdit wordId={word.id} field="translation" value={word.translation} inputClassName="w-[150px]" />
      case 'category':
        return <InlineCellEdit wordId={word.id} field="category" value={word.category} placeholder="—" inputClassName="w-[120px]" />
      case 'transcription':
        return <InlineCellEdit wordId={word.id} field="transcription" value={word.transcription} placeholder="—" inputClassName="w-[130px]" />
      case 'description':
        return <InlineCellEdit wordId={word.id} field="description" value={word.description} placeholder="—" inputClassName="w-[340px]" multiline />
      case 'short_description':
        return <InlineCellEdit wordId={word.id} field="short_description" value={word.short_description} placeholder="—" inputClassName="w-[300px]" multiline />
      case 'textbook':
        return (
          <TextbookInlineEdit
            wordId={word.id}
            textbookClass={word.textbook_class}
            textbookPart={word.textbook_part}
            textbookPage={word.textbook_page}
          />
        )
      case 'image':
        return <ImageInlineEdit wordId={word.id} imageUrl={word.image_url} wordName={word.word} />
      case 'status':
        return (
          <form action={togglePublishAction}>
            <input type="hidden" name="id" value={word.id} />
            <input type="hidden" name="is_published" value={String(word.is_published)} />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className={cn(
                'gap-1.5 text-xs',
                word.is_published ? 'border-green-500/30 text-green-600' : 'text-muted-foreground'
              )}
            >
              {word.is_published
                ? <><Eye className="size-3" /> Опубл.</>
                : <><EyeOff className="size-3" /> Черн.</>
              }
            </Button>
          </form>
        )
      case 'delete':
        return <DeleteWordButton wordId={word.id} wordName={word.word} />
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="min-w-max w-full text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            {columns.map(col => (
              <th
                key={col.id}
                draggable
                onDragStart={() => handleDragStart(col.id)}
                onDragOver={e => handleDragOver(e, col.id)}
                onDrop={handleDrop}
                className={cn(th, 'cursor-grab active:cursor-grabbing', col.alignRight && 'text-right')}
                style={{ minWidth: col.minWidth }}
              >
                <span className={cn('flex items-center gap-1', col.alignRight && 'justify-end')}>
                  <GripVertical className="size-3 opacity-40" />
                  {col.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {adding && (
            <NewWordTableRow columns={columns} onCancel={() => onAddingChange(false)} />
          )}
          {words.map(word => (
            <tr key={word.id} className="transition-colors hover:bg-muted/20">
              {columns.map(col => (
                <td key={col.id} className={cn(td, col.alignRight && 'text-right')}>
                  {renderCell(col, word)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
