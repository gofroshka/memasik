export type SectionId = 'english' | 'russian'

export const DEFAULT_SECTION: SectionId = 'english'

export interface SectionMeta {
  id: SectionId
  title: string
  tagline: string
  emoji: string
  /** Word-level field labels customised per section. */
  wordLabel: string
  translationLabel: string
  wordPlaceholder: string
  translationPlaceholder: string
  /** Heading on /learn etc. */
  learnHeading: string
}

export const SECTIONS: SectionMeta[] = [
  {
    id: 'english',
    title: 'Английский по образам',
    tagline: 'Мнемо-карточки для запоминания английских слов',
    emoji: '🇬🇧',
    wordLabel: 'Слово',
    translationLabel: 'Перевод',
    wordPlaceholder: 'apple',
    translationPlaceholder: 'яблоко',
    learnHeading: 'Английские слова',
  },
  {
    id: 'russian',
    title: 'Русские словарные слова',
    tagline: 'Запоминаем сложные написания через ассоциации',
    emoji: '🇷🇺',
    wordLabel: 'Слово',
    translationLabel: 'Подсказка / значение',
    wordPlaceholder: 'корова',
    translationPlaceholder: 'млекопитающее, даёт молоко',
    learnHeading: 'Русские словарные слова',
  },
]

export function isSectionId(s: unknown): s is SectionId {
  return s === 'english' || s === 'russian'
}

export function parseSection(raw: string | string[] | null | undefined, fallback: SectionId = DEFAULT_SECTION): SectionId {
  const v = Array.isArray(raw) ? raw[0] : raw
  return isSectionId(v) ? v : fallback
}

export function sectionMeta(id: SectionId): SectionMeta {
  return SECTIONS.find(s => s.id === id) ?? SECTIONS[0]
}

/** Build a query string preserving the section param. */
export function withSection(path: string, section: SectionId, extra?: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams()
  params.set('section', section)
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== '') params.set(k, String(v))
    }
  }
  return `${path}?${params.toString()}`
}
