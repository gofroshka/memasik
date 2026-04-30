'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitSuggestionAction(prevState: string | null, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Нужно войти в аккаунт'

  const word = (formData.get('word') as string).trim()
  const translation = (formData.get('translation') as string).trim()
  const transcription = (formData.get('transcription') as string).trim()
  const association = (formData.get('association') as string).trim()

  const { error } = await supabase.from('user_suggestions').insert({
    user_id: user.id,
    word,
    translation,
    transcription,
    association,
  })

  if (error) return error.message

  redirect('/suggest?success=1')
}

export async function deleteSuggestionAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('user_suggestions').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/suggestions')
}

export async function updateSuggestionStatusAction(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const status = formData.get('status') as 'approved' | 'rejected'

  if (status === 'approved') {
    const { data: suggestion, error: fetchError } = await supabase
      .from('user_suggestions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !suggestion) throw new Error('Предложение не найдено')

    const now = new Date().toISOString()
    const variant = {
      text: suggestion.association,
      image_url: null,
      short_description: null,
    }
    const { error: insertError } = await supabase.from('words').insert({
      word: suggestion.word,
      translation: suggestion.translation,
      transcription: suggestion.transcription,
      description: suggestion.association,
      associations: [variant],
      is_published: false,
      updated_at: now,
    })

    if (insertError) throw new Error(insertError.message)
  }

  const { error } = await supabase
    .from('user_suggestions')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/suggestions')
  revalidatePath('/admin/words')
}
