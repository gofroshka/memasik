'use server'

import { createClient } from '@/lib/supabase/server'
import { getString, getOptionalString, getOptionalInt, getBoolean } from '@/lib/form'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveWordAction(prevState: string | null, formData: FormData) {
  const supabase = await createClient()

  const id = getOptionalString(formData, 'id')
  const word = getString(formData, 'word')
  const translation = getString(formData, 'translation')
  const description = getString(formData, 'description')
  const category = getOptionalString(formData, 'category')
  const transcription = getOptionalString(formData, 'transcription')
  const imageFile = formData.get('image_file') as File | null
  const textbookPage = getOptionalInt(formData, 'textbook_page')
  const textbookClass = getOptionalInt(formData, 'textbook_class')
  const textbookPart = getOptionalInt(formData, 'textbook_part')
  const shortDescription = getOptionalString(formData, 'short_description')

  // Collect associations array from fields named associations[0], associations[1], ...
  const associations: string[] = []
  for (const [key, val] of formData.entries()) {
    if (key.startsWith('associations[') && typeof val === 'string') {
      const idx = parseInt(key.replace('associations[', '').replace(']', ''))
      if (!isNaN(idx)) associations[idx] = val
    }
  }
  const filteredAssociations = associations.filter(a => a && a.trim().length > 0)

  let finalImageUrl = getOptionalString(formData, 'image_url')

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const buffer = Buffer.from(await imageFile.arrayBuffer())

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('word-images')
      .upload(fileName, buffer, { contentType: imageFile.type, upsert: true })

    if (uploadError) return 'Ошибка загрузки изображения: ' + uploadError.message

    const { data: urlData } = supabase.storage.from('word-images').getPublicUrl(uploadData.path)
    finalImageUrl = urlData.publicUrl
  }

  const payload = {
    word,
    translation,
    description,
    category,
    transcription,
    image_url: finalImageUrl,
    textbook_page: textbookPage,
    textbook_class: textbookClass,
    textbook_part: textbookPart,
    short_description: shortDescription,
    associations: filteredAssociations,
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

export async function createWordInlineAction(formData: FormData): Promise<string | null> {
  const supabase = await createClient()
  const word = getString(formData, 'word')
  const translation = getString(formData, 'translation')

  const { error } = await supabase.from('words').insert({
    word,
    translation,
    description: '',
    category: getOptionalString(formData, 'category'),
    transcription: getOptionalString(formData, 'transcription'),
    textbook_class: getOptionalInt(formData, 'textbook_class'),
    textbook_part: getOptionalInt(formData, 'textbook_part'),
    textbook_page: getOptionalInt(formData, 'textbook_page'),
    is_published: false,
  })

  if (error) return error.message
  revalidatePath('/admin/words')
  return null
}

export async function updateWordImageAction(formData: FormData) {
  const supabase = await createClient()
  const id = getString(formData, 'id')
  const imageFile = formData.get('image_file') as File | null
  let imageUrl = getOptionalString(formData, 'image_url')

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('word-images')
      .upload(fileName, buffer, { contentType: imageFile.type, upsert: true })
    if (uploadError) throw new Error(uploadError.message)
    const { data: urlData } = supabase.storage.from('word-images').getPublicUrl(uploadData.path)
    imageUrl = urlData.publicUrl
  }

  const { error } = await supabase
    .from('words')
    .update({ image_url: imageUrl ?? null, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/words')
}

export async function patchWordAction(formData: FormData) {
  const supabase = await createClient()
  const id = getString(formData, 'id')
  const field = getString(formData, 'field')
  const ALLOWED = ['word', 'translation', 'description', 'category', 'transcription', 'short_description'] as const
  if (!ALLOWED.includes(field as typeof ALLOWED[number]))
    throw new Error(`Field "${field}" is not patchable`)
  const value = getOptionalString(formData, 'value')
  const { error } = await supabase
    .from('words')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/words')
}

export async function updateTextbookFieldsAction(formData: FormData) {
  const supabase = await createClient()
  const id = getString(formData, 'id')

  const { error } = await supabase.from('words').update({
    textbook_class: getOptionalInt(formData, 'textbook_class'),
    textbook_part: getOptionalInt(formData, 'textbook_part'),
    textbook_page: getOptionalInt(formData, 'textbook_page'),
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/words')
}

export async function togglePublishAction(formData: FormData) {
  const supabase = await createClient()
  const id = getString(formData, 'id')
  const current = getBoolean(formData, 'is_published')

  const { error } = await supabase.from('words').update({ is_published: !current }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/words')
}
