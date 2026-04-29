export type Role = 'user' | 'admin'

export interface Profile {
  id: string
  role: Role
  full_name: string | null
  created_at: string
}

export interface Word {
  id: string
  word: string
  translation: string
  description: string
  image_url: string | null
  category: string | null
  transcription: string | null
  transcription_en: string | null
  is_published: boolean
  textbook_page: number | null
  textbook_class: number | null
  textbook_part: number | null
  short_description: string | null
  full_analysis: string | null
  created_at: string
  updated_at: string
}
