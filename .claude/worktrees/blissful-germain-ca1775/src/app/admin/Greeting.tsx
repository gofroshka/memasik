'use client'

import { useMemo } from 'react'

export default function Greeting() {
  const { greeting, dateLabel } = useMemo(() => {
    const now = new Date()
    const h = now.getHours()
    const g =
      h < 6  ? 'Доброй ночи' :
      h < 12 ? 'Доброе утро' :
      h < 18 ? 'Добрый день' : 'Добрый вечер'
    const d = now.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })
    return { greeting: g, dateLabel: d }
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold">{greeting} 👋</h1>
      <p className="mt-0.5 text-sm text-muted-foreground">{dateLabel}</p>
    </div>
  )
}
