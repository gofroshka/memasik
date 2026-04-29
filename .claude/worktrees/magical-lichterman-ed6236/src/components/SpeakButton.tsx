'use client'

import { useEffect, useRef, useState } from 'react'
import { Square, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  text: string
  lang?: string
  variant?: 'default' | 'icon'
  title?: string
}

export default function SpeakButton({ text, lang = 'ru-RU', variant = 'default', title }: Props) {
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [])

  function toggle(e?: React.MouseEvent) {
    e?.preventDefault()
    e?.stopPropagation()

    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    utteranceRef.current = utterance

    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  if (typeof window !== 'undefined' && !window.speechSynthesis) return null

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggle}
        title={title ?? (speaking ? 'Остановить' : 'Озвучить')}
        aria-label={title ?? (speaking ? 'Остановить' : 'Озвучить')}
        className={cn(
          'inline-flex size-7 shrink-0 items-center justify-center rounded-full border transition-all',
          speaking
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-primary/6 hover:text-primary'
        )}
      >
        {speaking ? <Square className="size-3 fill-current" /> : <Volume2 className="size-3.5" />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={title ?? (speaking ? 'Остановить' : 'Озвучить разбор')}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all',
        speaking
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-primary/6 hover:text-primary'
      )}
    >
      {speaking ? <Square className="size-3 fill-current" /> : <Volume2 className="size-3" />}
      {speaking ? 'Стоп' : 'Озвучить'}
    </button>
  )
}
