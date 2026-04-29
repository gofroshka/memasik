import type { SupabaseClient } from '@supabase/supabase-js'
import type { Word } from '@/lib/types'

export interface WordFilters {
  q?: string
  category?: string
  textbook_class?: string
  textbook_part?: string
  textbook_page?: string
}

export async function getWordById(supabase: SupabaseClient, id: string): Promise<Word | null> {
  const { data, error } = await supabase.from('words').select('*').eq('id', id).single()
  if (error || !data) return null
  return data as Word
}

export async function getPublishedWords(supabase: SupabaseClient, filters: WordFilters = {}): Promise<Word[]> {
  let query = supabase.from('words').select('*').eq('is_published', true).order('word')
  const { q, category, textbook_class, textbook_part, textbook_page } = filters
  if (q) query = query.or(`word.ilike.%${q}%,translation.ilike.%${q}%`)
  if (category) query = query.eq('category', category)
  if (textbook_class) query = query.eq('textbook_class', parseInt(textbook_class))
  if (textbook_part) query = query.eq('textbook_part', parseInt(textbook_part))
  if (textbook_page) query = query.eq('textbook_page', parseInt(textbook_page))
  const { data } = await query
  return (data ?? []) as Word[]
}

export async function getUniqueCategories(supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase
    .from('words')
    .select('category')
    .eq('is_published', true)
    .not('category', 'is', null)
  return [...new Set((data ?? []).map(r => r.category).filter(Boolean))] as string[]
}

export async function getAvailableClasses(supabase: SupabaseClient): Promise<number[]> {
  const { data } = await supabase
    .from('words')
    .select('textbook_class')
    .eq('is_published', true)
    .not('textbook_class', 'is', null)
  return [...new Set((data ?? []).map(r => r.textbook_class).filter(Boolean))].sort((a, b) => a - b) as number[]
}

export async function getAdjacentWords(
  supabase: SupabaseClient,
  wordText: string
): Promise<{ prev: { id: string; word: string } | null; next: { id: string; word: string } | null }> {
  const [{ data: prevRows }, { data: nextRows }] = await Promise.all([
    supabase.from('words').select('id, word').lt('word', wordText).order('word', { ascending: false }).limit(1),
    supabase.from('words').select('id, word').gt('word', wordText).order('word', { ascending: true }).limit(1),
  ])
  return {
    prev: (prevRows?.[0] ?? null) as { id: string; word: string } | null,
    next: (nextRows?.[0] ?? null) as { id: string; word: string } | null,
  }
}
