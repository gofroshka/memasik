'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function saveWordAction(prevState: string | null, formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string | null
  const word = (formData.get('word') as string).trim()
  const translation = (formData.get('translation') as string).trim()
  const description = (formData.get('description') as string).trim()
  const category = (formData.get('category') as string | null)?.trim() || null
  const imageUrlRaw = (formData.get('image_url') as string | null)?.trim() || null
  const imageFile = formData.get('image_file') as File | null

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
    image_url: finalImageUrl || null,
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
