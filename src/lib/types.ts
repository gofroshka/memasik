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
  created_at: string
  updated_at: string
}
