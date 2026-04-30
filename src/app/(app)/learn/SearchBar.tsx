'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { parseSection } from '@/lib/sections'

interface SearchBarProps {
  q?: string
  category?: string
  textbookClass?: string
  textbookPart?: string
  textbookPage?: string
  availableClasses: number[]
}

export default function SearchBar({ q, category, textbookClass, textbookPart, textbookPage, availableClasses }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const section = parseSection(searchParams.get('section') ?? undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const pageRef = useRef<HTMLInputElement>(null)
  const [selectedClass, setSelectedClass] = useState(textbookClass ?? '')
  const [selectedPart, setSelectedPart] = useState(textbookPart ?? '')

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = q ?? ''
  }, [q])

  useEffect(() => { setSelectedClass(textbookClass ?? '') }, [textbookClass])
  useEffect(() => { setSelectedPart(textbookPart ?? '') }, [textbookPart])

  function buildParams(overrides: Record<string, string> = {}) {
    const params = new URLSearchParams()
    params.set('section', section)
    const value = overrides.q ?? inputRef.current?.value.trim() ?? ''
    const cls = overrides.textbook_class ?? selectedClass
    const part = overrides.textbook_part ?? selectedPart
    const page = overrides.textbook_page ?? pageRef.current?.value.trim() ?? ''
    if (value) params.set('q', value)
    if (category) params.set('category', category)
    if (cls) params.set('textbook_class', cls)
    if (part) params.set('textbook_part', part)
    if (page) params.set('textbook_page', page)
    return params
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const params = buildParams()
    router.push(`/learn?${params}`)
  }

  function handleReset() {
    if (inputRef.current) inputRef.current.value = ''
    if (pageRef.current) pageRef.current.value = ''
    setSelectedClass('')
    setSelectedPart('')
    const params = new URLSearchParams()
    params.set('section', section)
    if (category) params.set('category', category)
    router.push(`/learn?${params}`)
  }

  function handleClassChange(val: string) {
    setSelectedClass(val)
    if (!val) setSelectedPart('')
    const params = buildParams({ textbook_class: val, textbook_part: val ? selectedPart : '' })
    router.push(`/learn?${params}`)
  }

  function handlePartChange(val: string) {
    setSelectedPart(val)
    const params = buildParams({ textbook_part: val })
    router.push(`/learn?${params}`)
  }

  const isFiltered = !!(q || category || textbookClass || textbookPart || textbookPage)
  const selectClass = 'h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative max-w-lg flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            name="q"
            defaultValue={q}
            type="text"
            placeholder="Поиск по слову или переводу..."
            className="pl-9"
            autoComplete="off"
          />
        </div>
        <Button type="submit" variant="outline" className="shrink-0">
          Найти
        </Button>
        {isFiltered && (
          <button
            type="button"
            onClick={handleReset}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5 text-muted-foreground')}
          >
            <X className="size-3.5" />
            Сбросить
          </button>
        )}
      </form>

      {availableClasses.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedClass}
            onChange={e => handleClassChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Все классы</option>
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>{cls} класс</option>
            ))}
          </select>

          {selectedClass && (
            <select
              value={selectedPart}
              onChange={e => handlePartChange(e.target.value)}
              className={selectClass}
            >
              <option value="">Обе части</option>
              <option value="1">Часть 1</option>
              <option value="2">Часть 2</option>
            </select>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              ref={pageRef}
              type="number"
              name="textbook_page"
              min={1}
              defaultValue={textbookPage ?? ''}
              placeholder="Страница"
              className="h-9 w-28"
            />
            {textbookPage && (
              <Button type="submit" variant="outline" size="sm">
                Применить
              </Button>
            )}
          </form>
        </div>
      )}
    </div>
  )
}
