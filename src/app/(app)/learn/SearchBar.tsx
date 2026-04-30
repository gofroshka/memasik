'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { parseSection } from '@/lib/sections'

interface SearchBarProps {
  q?: string
  category?: string
}

export default function SearchBar({ q, category }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const section = parseSection(searchParams.get('section') ?? undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = q ?? ''
  }, [q])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = inputRef.current?.value.trim() ?? ''
    const params = new URLSearchParams()
    params.set('section', section)
    // Preserve every existing filter except `q`, which we override.
    for (const [k, v] of searchParams.entries()) {
      if (k === 'q' || k === 'section') continue
      params.set(k, v)
    }
    if (value) params.set('q', value)
    router.push(`/learn?${params}`)
  }

  function handleReset() {
    if (inputRef.current) inputRef.current.value = ''
    const params = new URLSearchParams()
    params.set('section', section)
    if (category) params.set('category', category)
    router.push(`/learn?${params}`)
  }

  return (
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
      {q && (
        <button
          type="button"
          onClick={handleReset}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5 text-muted-foreground')}
        >
          <X className="size-3.5" />
          Сбросить поиск
        </button>
      )}
    </form>
  )
}
