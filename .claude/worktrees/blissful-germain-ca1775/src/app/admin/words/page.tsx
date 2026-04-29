import { createClient } from '@/lib/supabase/server'
import { Word } from '@/lib/types'
import WordsClient from './WordsClient'

export default async function AdminWordsPage() {
  const supabase = await createClient()
  const { data: words } = await supabase
    .from('words')
    .select('*')
    .order('created_at', { ascending: false })

  return <WordsClient words={(words ?? []) as Word[]} />
}
