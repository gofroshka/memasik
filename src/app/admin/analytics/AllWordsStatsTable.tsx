'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Eye, GripVertical, ThumbsDown, ThumbsUp } from 'lucide-react'

interface WordStat {
  id: string
  word: string
  translation: string
  views: number
  up: number
  down: number
}

type ColumnId = 'word' | 'views' | 'up' | 'down' | 'rate' | 'actions'

interface Column {
  id: ColumnId
  label: string
}

const DEFAULT_COLUMNS: Column[] = [
  { id: 'word', label: 'Слово' },
  { id: 'views', label: 'Просмотры' },
  { id: 'up', label: '👍' },
  { id: 'down', label: '👎' },
  { id: 'rate', label: 'Рейтинг' },
  { id: 'actions', label: '' },
]

export default function AllWordsStatsTable({ stats }: { stats: WordStat[] }) {
  const [columns, setColumns] = useState<Column[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('analytics-columns')
        if (saved) {
          const parsed = JSON.parse(saved) as ColumnId[]
          const ordered = parsed
            .map(id => DEFAULT_COLUMNS.find(c => c.id === id))
            .filter(Boolean) as Column[]
          // Add any new columns not in saved order
          DEFAULT_COLUMNS.forEach(c => {
            if (!ordered.find(o => o.id === c.id)) ordered.push(c)
          })
          return ordered
        }
      } catch {}
    }
    return DEFAULT_COLUMNS
  })

  const dragColRef = useRef<ColumnId | null>(null)
  const dragOverColRef = useRef<ColumnId | null>(null)

  function saveColumnOrder(cols: Column[]) {
    try {
      localStorage.setItem('analytics-columns', JSON.stringify(cols.map(c => c.id)))
    } catch {}
  }

  function handleDragStart(colId: ColumnId) {
    dragColRef.current = colId
  }

  function handleDragOver(e: React.DragEvent, colId: ColumnId) {
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

  function renderCell(col: Column, w: WordStat) {
    const total = w.up + w.down
    const rate = total > 0 ? Math.round((w.up / total) * 100) : null

    switch (col.id) {
      case 'word':
        return (
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold">{w.word}</span>
              <span className="text-xs text-muted-foreground truncate">{w.translation}</span>
            </div>
          </div>
        )
      case 'views':
        return (
          <span className="flex items-center gap-1 text-sm tabular-nums">
            <Eye className="size-3 text-muted-foreground" />{w.views}
          </span>
        )
      case 'up':
        return (
          <span className="flex items-center gap-1 text-sm tabular-nums text-green-600">
            <ThumbsUp className="size-3" />{w.up}
          </span>
        )
      case 'down':
        return (
          <span className="flex items-center gap-1 text-sm tabular-nums text-red-500">
            <ThumbsDown className="size-3" />{w.down}
          </span>
        )
      case 'rate':
        return rate !== null ? (
          <span className={cn(
            'text-sm font-semibold tabular-nums',
            rate >= 70 ? 'text-green-600' : rate >= 40 ? 'text-amber-600' : 'text-red-500'
          )}>
            {rate}%
          </span>
        ) : <span className="text-xs text-muted-foreground">—</span>
      case 'actions':
        return (
          <Link
            href={`/admin/analytics/${w.id}`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0 text-xs')}
          >
            Подробнее
          </Link>
        )
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map(col => (
              <th
                key={col.id}
                draggable={col.id !== 'actions'}
                onDragStart={() => handleDragStart(col.id)}
                onDragOver={e => handleDragOver(e, col.id)}
                onDrop={handleDrop}
                className={cn(
                  'px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground select-none',
                  col.id !== 'actions' && 'cursor-grab active:cursor-grabbing'
                )}
              >
                <span className="flex items-center gap-1">
                  {col.id !== 'actions' && <GripVertical className="size-3 opacity-40" />}
                  {col.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {stats.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
                Нет данных
              </td>
            </tr>
          ) : (
            stats.map(w => (
              <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                {columns.map(col => (
                  <td key={col.id} className="px-5 py-3.5">
                    {renderCell(col, w)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
