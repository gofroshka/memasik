import type { SectionId } from './sections'

export type Role = 'user' | 'admin'

export interface Profile {
  id: string
  role: Role
  full_name: string | null
  created_at: string
}

export interface AssociationVariant {
  text: string
  image_url: string | null
  short_description: string | null
}

export interface Word {
  id: string
  section: SectionId
  word: string
  translation: string
  description: string
  image_url: string | null
  category: string | null
  transcription: string | null
  is_published: boolean
  textbook_page: number | null
  textbook_class: number | null
  textbook_part: number | null
  short_description: string | null
  associations: AssociationVariant[]
  created_at: string
  updated_at: string
}
