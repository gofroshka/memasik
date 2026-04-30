'use client'

import { useEffect, useRef, useState } from 'react'
import { Square, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Picks the most natural-sounding voice the browser exposes for the given
// BCP-47 language tag. Premium / neural / cloud voices are scored higher than
// the default robotic ones. Returns null if no matching voice is available.
function pickBestVoice(lang: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const want = lang.toLowerCase().split('-')[0]
  const candidates = voices.filter(v => v.lang.toLowerCase().startsWith(want))
  if (candidates.length === 0) return null

  // Hints in the voice name that usually mean a higher-quality voice.
  const QUALITY_HINTS = [
    'premium', 'enhanced', 'neural', 'natural', 'wavenet', 'studio',
    'online', 'multilingual', 'siri', 'google', 'microsoft',
  ]
  // Specific voices known to sound good on macOS / iOS / Windows.
  const PREFERRED_NAMES = [
    'milena', 'yuri', 'katya', 'vera', 'samantha', 'alex',
    'karen', 'serena', 'allison', 'ava', 'tom', 'daniel',
    'pavel', 'svetlana', 'irina',
  ]

  function score(v: SpeechSynthesisVoice): number {
    const name = v.name.toLowerCase()
    let s = 0
    if (!v.localService) s += 5            // cloud voices are usually better
    if (PREFERRED_NAMES.some(n => name.includes(n))) s += 4
    if (QUALITY_HINTS.some(h => name.includes(h))) s += 3
    if (v.lang.toLowerCase() === lang.toLowerCase()) s += 1  // exact locale wins ties
    if (v.default) s -= 1                  // browser default is usually the worst
    return s
  }

  const sorted = [...candidates].sort((a, b) => score(b) - score(a))
  return sorted[0] ?? null
}

export default function SpeakButton({ text, lang = 'ru-RU', label }: { text: string; lang?: string; label?: string }) {
  const [speaking, setSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    function refresh() {
      setVoices(window.speechSynthesis.getVoices())
    }
    refresh()
    // Voices load asynchronously in Chrome / some browsers.
    window.speechSynthesis.addEventListener('voiceschanged', refresh)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', refresh)
      window.speechSynthesis.cancel()
    }
  }, [])

  function toggle() {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    const best = pickBestVoice(lang, voices)
    if (best) {
      utterance.voice = best
      utterance.lang = best.lang
    }
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    utteranceRef.current = utterance

    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  if (typeof window !== 'undefined' && !window.speechSynthesis) return null

  return (
    <button
      onClick={toggle}
      title={speaking ? 'Остановить' : (label ?? 'Озвучить разбор')}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all',
        speaking
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-primary/6 hover:text-primary'
      )}
    >
      {speaking ? <Square className="size-3 fill-current" /> : <Volume2 className="size-3" />}
      {speaking ? 'Стоп' : (label ?? 'Озвучить')}
    </button>
  )
}
