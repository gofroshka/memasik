'use server'

import { createClient } from '@/lib/supabase/server'
import { getString, getOptionalString, getOptionalInt, getBoolean } from '@/lib/form'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AssociationVariant } from '@/lib/types'
import { parseSection } from '@/lib/sections'

async function uploadWordImage(supabase: SupabaseClient, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { data, error } = await supabase.storage
    .from('word-images')
    .upload(fileName, buffer, { contentType: file.type, upsert: true })
  if (error) throw new Error(error.message)
  const { data: urlData } = supabase.storage.from('word-images').getPublicUrl(data.path)
  return urlData.publicUrl
}

async function collectVariants(
  formData: FormData,
  supabase: SupabaseClient,
): Promise<AssociationVariant[]> {
  // Group entries by variant index, then build & upload.
  type Slot = { id?: string; text?: string; short_description?: string; image_url?: string; image_file?: File }
  const byIndex = new Map<number, Slot>()

  for (const [key, val] of formData.entries()) {
    const match = key.match(/^assoc\[(\d+)\]\[(id|text|short_description|image_url|image_file)\]$/)
    if (!match) continue
    const idx = parseInt(match[1], 10)
    const field = match[2]
    if (!byIndex.has(idx)) byIndex.set(idx, {})
    const slot = byIndex.get(idx)!
    if (field === 'image_file') {
      if (val instanceof File && val.size > 0) slot.image_file = val
    } else if (typeof val === 'string') {
      slot[field as 'id' | 'text' | 'short_description' | 'image_url'] = val
    }
  }

  const ordered = [...byIndex.entries()].sort(([a], [b]) => a - b).map(([, v]) => v)

  const result: AssociationVariant[] = []
  for (const slot of ordered) {
    const text = (slot.text ?? '').trim()
    if (!text) continue
    let imageUrl: string | null = (slot.image_url ?? '').trim() || null
    if (slot.image_file) imageUrl = await uploadWordImage(supabase, slot.image_file)
    const shortDesc = (slot.short_description ?? '').trim() || null
    const id = (slot.id ?? '').trim() || crypto.randomUUID()
    result.push({ id, text, image_url: imageUrl, short_description: shortDesc })
  }
  return result
}

export async function saveWordAction(prevState: string | null, formData: FormData) {
  const supabase = await createClient()

  const id = getOptionalString(formData, 'id')
  const section = parseSection(getOptionalString(formData, 'section'))
  const word = getString(formData, 'word')
  const translation = getString(formData, 'translation')
  const category = getOptionalString(formData, 'category')
  const transcription = getOptionalString(formData, 'transcription')
  const textbookPage = getOptionalInt(formData, 'textbook_page')
  const textbookClass = getOptionalInt(formData, 'textbook_class')
  const textbookPart = getOptionalInt(formData, 'textbook_part')

  const dupQuery = supabase
    .from('words')
    .select('id')
    .eq('section', section)
    .ilike('word', word.trim())
    .limit(1)
  if (id) dupQuery.neq('id', id)
  const { data: dups } = await dupQuery
  if (dups && dups.length > 0) return `Слово «${word.trim()}» уже есть в списке`

  let variants: AssociationVariant[] = []
  try {
    variants = await collectVariants(formData, supabase)
  } catch (e) {
    return 'Ошибка загрузки картинки варианта: ' + (e instanceof Error ? e.message : String(e))
  }

  // Top-level image / short_description / description mirror the primary
  // variant so the rest of the app (lists, search, learn page) keeps working
  // without reaching into the associations array.
  const primary = variants[0] ?? null
  const finalImageUrl = primary?.image_url ?? null
  const shortDescription = primary?.short_description ?? null
  const description = primary?.text ?? ''

  const payload = {
    section,
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
    associations: variants,
    updated_at: new Date().toISOString(),
  }

  if (id) {
    const { error } = await supabase.from('words').update(payload).eq('id', id)
    if (error) return error.message
  } else {
    const { error } = await supabase.from('words').insert(payload)
    if (error) return error.message
  }

  redirect(`/admin/words?section=${section}`)
}

export async function createWordInlineAction(formData: FormData): Promise<string | null> {
  const supabase = await createClient()
  const word = getString(formData, 'word')
  const translation = getString(formData, 'translation')
  const section = parseSection(getOptionalString(formData, 'section'))

  const { data: dups } = await supabase
    .from('words')
    .select('id')
    .eq('section', section)
    .ilike('word', word.trim())
    .limit(1)
  if (dups && dups.length > 0) return `Слово «${word.trim()}» уже есть в списке`

  const { error } = await supabase.from('words').insert({
    section,
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

  // Mirror the change into the primary variant so the editor and the user
  // card stay in sync with the inline thumbnail.
  const { data: existing } = await supabase
    .from('words')
    .select('associations')
    .eq('id', id)
    .single()
  const variants = ((existing?.associations as AssociationVariant[] | null) ?? []).slice()
  if (variants.length === 0) {
    variants.push({ id: crypto.randomUUID(), text: '', short_description: null, image_url: imageUrl ?? null })
  } else {
    variants[0] = { ...variants[0], image_url: imageUrl ?? null }
  }

  const { error } = await supabase
    .from('words')
    .update({
      image_url: imageUrl ?? null,
      associations: variants,
      updated_at: new Date().toISOString(),
    })
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

  const update: Record<string, unknown> = {
    [field]: value,
    updated_at: new Date().toISOString(),
  }

  // Description and short_description live both on the word row and on the
  // primary variant. Keep them mirrored so neither view goes stale.
  if (field === 'description' || field === 'short_description') {
    const { data: existing } = await supabase
      .from('words')
      .select('associations')
      .eq('id', id)
      .single()
    const variants = ((existing?.associations as AssociationVariant[] | null) ?? []).slice()
    const variantField = field === 'description' ? 'text' : 'short_description'
    if (variants.length === 0) {
      variants.push({
        id: crypto.randomUUID(),
        text: '',
        short_description: null,
        image_url: null,
        [variantField]: value ?? '',
      } as AssociationVariant)
    } else {
      variants[0] = { ...variants[0], [variantField]: value ?? (field === 'description' ? '' : null) }
    }
    update.associations = variants
  }

  const { error } = await supabase
    .from('words')
    .update(update)
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
