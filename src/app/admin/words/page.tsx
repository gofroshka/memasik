import { createClient } from '@/lib/supabase/server'
import { Word } from '@/lib/types'
import WordsClient from './WordsClient'
import { parseSection } from '@/lib/sections'

interface AdminWordsPageProps {
  searchParams: Promise<{ section?: string }>
}

export default async function AdminWordsPage({ searchParams }: AdminWordsPageProps) {
  const params = await searchParams
  const section = parseSection(params.section)
  const supabase = await createClient()
  const { data: words } = await supabase
    .from('words')
    .select('*')
    .eq('section', section)

  return <WordsClient words={(words ?? []) as Word[]} section={section} />
}
