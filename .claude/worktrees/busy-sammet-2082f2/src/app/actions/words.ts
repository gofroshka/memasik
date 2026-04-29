'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveWordAction(prevState: string | null, formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string | null
  const word = (formData.get('word') as string).trim()
  const translation = (formData.get('translation') as string).trim()
  const description = (formData.get('description') as string).trim()
  const category = (formData.get('category') as string | null)?.trim() || null
  const transcription = (formData.get('transcription') as string | null)?.trim() || null
  const imageUrlRaw = (formData.get('image_url') as string | null)?.trim() || null
  const imageFile = formData.get('image_file') as File | null
  const textbookPageRaw = (formData.get('textbook_page') as string | null)?.trim()
  const textbookPage = textbookPageRaw ? parseInt(textbookPageRaw, 10) : null
  const textbookClassRaw = (formData.get('textbook_class') as string | null)?.trim()
  const textbookClass = textbookClassRaw ? parseInt(textbookClassRaw, 10) : null
  const textbookPartRaw = (formData.get('textbook_part') as string | null)?.trim()
  const textbookPart = textbookPartRaw ? parseInt(textbookPartRaw, 10) : null
  const shortDescription = (formData.get('short_description') as string | null)?.trim() || null
  const fullAnalysis = (formData.get('full_analysis') as string | null)?.trim() || null

  let finalImageUrl = imageUrlRaw

  // Upload image file if provided
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const buffer = Buffer.from(await imageFile.arrayBuffer())

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('word-images')
      .upload(fileName, buffer, {
        contentType: imageFile.type,
        upsert: true,
      })

    if (uploadError) {
      return 'Ошибка загрузки изображения: ' + uploadError.message
    }

    const { data: urlData } = supabase.storage.from('word-images').getPublicUrl(uploadData.path)
    finalImageUrl = urlData.publicUrl
  }

  const payload = {
    word,
    translation,
    description,
    category,
    transcription,
    image_url: finalImageUrl || null,
    textbook_page: textbookPage,
    textbook_class: textbookClass,
    textbook_part: textbookPart,
    short_description: shortDescription,
    full_analysis: fullAnalysis,
    updated_at: new Date().toISOString(),
  }

  if (id) {
    const { error } = await supabase.from('words').update(payload).eq('id', id)
    if (error) return error.message
  } else {
    const { error } = await supabase.from('words').insert(payload)
    if (error) return error.message
  }

  redirect('/admin/words')
}

export async function togglePublishAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const current = formData.get('is_published') === 'true'

  const { error } = await supabase
    .from('words')
    .update({ is_published: !current })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/words')
}
