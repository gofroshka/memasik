'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitFeedbackAction(wordId: string, vote: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Нужно войти в аккаунт' }

  // Check existing vote
  const { data: existing } = await supabase
    .from('word_feedback')
    .select('id, vote')
    .eq('user_id', user.id)
    .eq('word_id', wordId)
    .single()

  if (existing) {
    if (existing.vote === vote) {
      // Same vote — remove (toggle off)
      await supabase.from('word_feedback').delete().eq('id', existing.id)
    } else {
      // Different vote — update
      await supabase.from('word_feedback').update({ vote }).eq('id', existing.id)
    }
  } else {
    await supabase.from('word_feedback').insert({ user_id: user.id, word_id: wordId, vote })
  }

  revalidatePath(`/words/${wordId}`)
  return { error: null }
}
