import { createClient } from '@/lib/supabase/server'
import { Word } from '@/lib/types'
import WordsClient from './WordsClient'

export default async function AdminWordsPage() {
  const supabase = await createClient()
  const { data: words } = await supabase
    .from('words')
    .select('*')

  const sorted = ((words ?? []) as Word[]).sort((a, b) =>
    (a.word ?? '').localeCompare(b.word ?? '', 'en', { sensitivity: 'base' })
  )

  return <WordsClient words={sorted} />
}
