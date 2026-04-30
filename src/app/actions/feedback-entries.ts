'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const TYPES = ['bug', 'idea', 'other'] as const
const STATUSES = ['new', 'in_progress', 'done', 'rejected'] as const

type FeedbackType = (typeof TYPES)[number]
type FeedbackStatus = (typeof STATUSES)[number]

export async function submitFeedbackEntryAction(prevState: string | null, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Нужно войти в аккаунт'

  const rawType = (formData.get('type') as string | null) ?? 'other'
  const type: FeedbackType = TYPES.includes(rawType as FeedbackType) ? (rawType as FeedbackType) : 'other'
  const message = ((formData.get('message') as string | null) ?? '').trim()
  if (!message) return 'Напишите сообщение'

  const { error } = await supabase.from('user_feedback').insert({
    user_id: user.id,
    type,
    message,
  })
  if (error) return error.message

  redirect('/feedback?success=1')
}

export async function updateFeedbackStatusAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const rawStatus = (formData.get('status') as string | null) ?? ''
  if (!STATUSES.includes(rawStatus as FeedbackStatus)) {
    throw new Error(`Invalid status: ${rawStatus}`)
  }
  const status = rawStatus as FeedbackStatus

  const adminNote = ((formData.get('admin_note') as string | null) ?? '').trim() || null

  const { error } = await supabase
    .from('user_feedback')
    .update({ status, admin_note: adminNote, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/feedback')
}

export async function deleteFeedbackEntryAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const { error } = await supabase.from('user_feedback').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/feedback')
}
