'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function SearchBar({ q, category }: { q?: string; category?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync input value when URL changes (e.g. after reset)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = q ?? ''
    }
  }, [q])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = inputRef.current?.value.trim() ?? ''
    const params = new URLSearchParams()
    if (value) params.set('q', value)
    if (category) params.set('category', category)
    router.push(`/learn${params.size ? `?${params}` : ''}`)
  }

  function handleReset() {
    if (inputRef.current) inputRef.current.value = ''
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    router.push(`/learn${params.size ? `?${params}` : ''}`)
  }

  const isFiltered = !!(q || category)

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
      {isFiltered && (
        <button
          type="button"
          onClick={handleReset}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'gap-1.5 text-muted-foreground'
          )}
        >
          <X className="size-3.5" />
          Сбросить
        </button>
      )}
    </form>
  )
}
