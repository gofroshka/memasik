'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Word } from '@/lib/types'
import { DEFAULT_SECTION, sectionMeta, type SectionId } from '@/lib/sections'
import { ImagePlus, Link2, Plus, Star, Trash2, Upload, X } from 'lucide-react'
import { saveWordAction } from '@/app/actions/words'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type VariantImage =
  | { type: 'url'; url: string }
  | { type: 'file'; preview: string }
  | { type: 'none' }

interface VariantState {
  // Stable client-only key so React keeps the same DOM (and file inputs)
  // across reorders.
  _id: string
  text: string
  short_description: string
  image: VariantImage
}

function newVariantId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function seedVariants(word?: Word): VariantState[] {
  if (word?.associations && word.associations.length > 0) {
    return word.associations.map(v => ({
      _id: newVariantId(),
      text: v.text ?? '',
      short_description: v.short_description ?? '',
      image: v.image_url ? { type: 'url' as const, url: v.image_url } : { type: 'none' as const },
    }))
  }
  if (word?.description) {
    return [{ _id: newVariantId(), text: word.description, short_description: '', image: { type: 'none' } }]
  }
  return [{ _id: newVariantId(), text: '', short_description: '', image: { type: 'none' } }]
}

export default function WordForm({ word, section: sectionProp }: { word?: Word; section?: SectionId }) {
  const router = useRouter()
  const [error, formAction, pending] = useActionState(saveWordAction, null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const section: SectionId = word?.section ?? sectionProp ?? DEFAULT_SECTION
  const meta = sectionMeta(section)
  const isRussian = section === 'russian'

  const [imageState, setImageState] = useState<VariantImage>(
    word?.image_url ? { type: 'url', url: word.image_url } : { type: 'none' }
  )

  const [variants, setVariants] = useState<VariantState[]>(() => seedVariants(word))

  const preview = imageState.type !== 'none'
    ? (imageState.type === 'url' ? imageState.url : imageState.preview)
    : ''

  useEffect(() => {
    if (imageState.type === 'file') {
      return () => URL.revokeObjectURL(imageState.preview)
    }
  }, [imageState])

  // Clean up object URLs for variant images on unmount / replacement.
  useEffect(() => {
    return () => {
      variants.forEach(v => {
        if (v.image.type === 'file') URL.revokeObjectURL(v.image.preview)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageState({ type: 'file', preview: URL.createObjectURL(file) })
  }

  function clearImage() {
    setImageState({ type: 'none' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function addVariant() {
    setVariants(prev => [...prev, { _id: newVariantId(), text: '', short_description: '', image: { type: 'none' } }])
  }

  function makePrimary(i: number) {
    setVariants(prev => {
      if (i <= 0 || i >= prev.length) return prev
      const next = [...prev]
      const [picked] = next.splice(i, 1)
      next.unshift(picked)
      return next
    })
  }

  function removeVariant(i: number) {
    setVariants(prev => {
      const removed = prev[i]
      if (removed?.image.type === 'file') URL.revokeObjectURL(removed.image.preview)
      return prev.filter((_, idx) => idx !== i)
    })
  }

  function updateVariant(i: number, patch: Partial<VariantState>) {
    setVariants(prev => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)))
  }

  function setVariantImageFromFile(i: number, file: File) {
    setVariants(prev => prev.map((v, idx) => {
      if (idx !== i) return v
      if (v.image.type === 'file') URL.revokeObjectURL(v.image.preview)
      return { ...v, image: { type: 'file', preview: URL.createObjectURL(file) } }
    }))
  }

  function setVariantImageFromUrl(i: number, url: string) {
    const trimmed = url.trim()
    setVariants(prev => prev.map((v, idx) => {
      if (idx !== i) return v
      if (v.image.type === 'file') URL.revokeObjectURL(v.image.preview)
      return { ...v, image: trimmed ? { type: 'url', url: trimmed } : { type: 'none' } }
    }))
  }

  function clearVariantImage(i: number) {
    setVariants(prev => prev.map((v, idx) => {
      if (idx !== i) return v
      if (v.image.type === 'file') URL.revokeObjectURL(v.image.preview)
      return { ...v, image: { type: 'none' } }
    }))
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {word?.id && <input type="hidden" name="id" value={word.id} />}
      <input type="hidden" name="section" value={section} />
      {imageState.type === 'url' && <input type="hidden" name="image_url" value={imageState.url} />}
      {imageState.type === 'none' && <input type="hidden" name="image_url" value="" />}

      {/* Per-variant hidden inputs — file inputs are rendered inline below */}
      {variants.map((v, i) => (
        <div key={`hidden-${v._id}`}>
          <input type="hidden" name={`assoc[${i}][text]`} value={v.text} />
          <input type="hidden" name={`assoc[${i}][short_description]`} value={v.short_description} />
          <input
            type="hidden"
            name={`assoc[${i}][image_url]`}
            value={v.image.type === 'url' ? v.image.url : ''}
          />
        </div>
      ))}
      {/* Keep description in sync with first variant for backward compat */}
      <input type="hidden" name="description" value={variants[0]?.text ?? ''} />

      {/* Main fields */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-2">
          <h2 className="font-semibold">
            {word ? 'Редактирование карточки' : 'Новая карточка'}
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
            {meta.emoji} {meta.title}
          </span>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="word">{meta.wordLabel} *</Label>
              <Input
                id="word"
                type="text"
                name="word"
                required
                defaultValue={word?.word}
                placeholder={meta.wordPlaceholder}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="translation">{meta.translationLabel} *</Label>
              <Input
                id="translation"
                type="text"
                name="translation"
                required
                defaultValue={word?.translation}
                placeholder={meta.translationPlaceholder}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="category">Категория</Label>
              <Input
                id="category"
                type="text"
                name="category"
                defaultValue={word?.category ?? ''}
                placeholder="Фрукты, Животные..."
              />
            </div>
            {!isRussian && (
              <div className="space-y-1.5">
                <Label htmlFor="transcription">Транскрипция на русском</Label>
                <Input
                  id="transcription"
                  type="text"
                  name="transcription"
                  defaultValue={word?.transcription ?? ''}
                  placeholder="пиджн"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="short_description">Краткое описание</Label>
            <Input
              id="short_description"
              type="text"
              name="short_description"
              defaultValue={word?.short_description ?? ''}
              placeholder={isRussian ? 'Букву О запомним так…' : 'Смех — лавка'}
            />
          </div>

          {!isRussian && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="textbook_class">Класс Rainbow English</Label>
                <Input
                  id="textbook_class"
                  type="number"
                  name="textbook_class"
                  min={1}
                  max={11}
                  defaultValue={word?.textbook_class ?? ''}
                  placeholder="3"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="textbook_part">Часть</Label>
                <Input
                  id="textbook_part"
                  type="number"
                  name="textbook_part"
                  min={1}
                  max={2}
                  defaultValue={word?.textbook_part ?? ''}
                  placeholder="1"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="textbook_page">Страница</Label>
                <Input
                  id="textbook_page"
                  type="number"
                  name="textbook_page"
                  min={1}
                  defaultValue={word?.textbook_page ?? ''}
                  placeholder="42"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Associations */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-semibold">Варианты ассоциаций</h2>
          <Button type="button" variant="outline" size="sm" onClick={addVariant} className="gap-1.5">
            <Plus className="size-3.5" />
            Добавить вариант
          </Button>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Первый вариант — основной (он показывается по умолчанию на карточке слова и в флешкартах). Остальные пользователь увидит, переключаясь между ними.
        </p>

        <div className="space-y-5">
          {variants.map((v, i) => (
            <VariantEditor
              key={v._id}
              index={i}
              total={variants.length}
              variant={v}
              onChangeText={text => updateVariant(i, { text })}
              onChangeShortDesc={short_description => updateVariant(i, { short_description })}
              onPickFile={file => setVariantImageFromFile(i, file)}
              onChangeUrl={url => setVariantImageFromUrl(i, url)}
              onClearImage={() => clearVariantImage(i)}
              onRemove={() => removeVariant(i)}
              onMakePrimary={() => makePrimary(i)}
            />
          ))}
        </div>
      </div>

      {/* Image */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ImagePlus className="size-4 text-muted-foreground" />
          <h2 className="font-semibold">Главное изображение</h2>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Используется в списках и в шапке карточки. Если у варианта своя картинка — она показывается внутри варианта.
        </p>

        <div className="space-y-4">
          {preview && (
            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={clearImage}
                className="absolute right-2 top-2 size-7 rounded-md"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}

          <label
            className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-center transition-colors hover:bg-muted/50 ${preview ? 'hidden' : ''}`}
          >
            <Upload className="mb-2 size-6 text-muted-foreground" />
            <span className="text-sm font-medium">Загрузить изображение</span>
            <span className="mt-0.5 text-xs text-muted-foreground">PNG, JPG, WebP</span>
            <input
              ref={fileInputRef}
              type="file"
              name="image_file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {!preview && (
            <div className="space-y-1.5">
              <Label htmlFor="image-url" className="flex items-center gap-1.5">
                <Link2 className="size-3.5 text-muted-foreground" />
                Или укажите URL
              </Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://..."
                defaultValue={imageState.type === 'url' ? imageState.url : ''}
                onChange={e => {
                  const val = e.target.value.trim()
                  setImageState(val ? { type: 'url', url: val } : { type: 'none' })
                }}
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Сохранение...' : word ? 'Сохранить изменения' : 'Добавить слово'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>
    </form>
  )
}

interface VariantEditorProps {
  index: number
  total: number
  variant: VariantState
  onChangeText: (v: string) => void
  onChangeShortDesc: (v: string) => void
  onPickFile: (file: File) => void
  onChangeUrl: (url: string) => void
  onClearImage: () => void
  onRemove: () => void
  onMakePrimary: () => void
}

function VariantEditor({
  index, total, variant, onChangeText, onChangeShortDesc,
  onPickFile, onChangeUrl, onClearImage, onRemove, onMakePrimary,
}: VariantEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isPrimary = index === 0
  const preview =
    variant.image.type === 'url' ? variant.image.url
    : variant.image.type === 'file' ? variant.image.preview
    : ''

  function handleClear() {
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClearImage()
  }

  return (
    <div className={cn(
      'rounded-lg border p-4',
      isPrimary
        ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/15'
        : 'border-border bg-muted/20'
    )}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={cn(
          'inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide',
          isPrimary ? 'text-primary' : 'text-muted-foreground'
        )}>
          {isPrimary && <Star className="size-3.5 fill-primary text-primary" />}
          {total > 1
            ? (isPrimary ? 'Основной вариант' : `Вариант ${index + 1}`)
            : 'Ассоциация'}
        </span>
        {total > 1 && (
          <div className="flex items-center gap-3">
            {!isPrimary && (
              <button
                type="button"
                onClick={onMakePrimary}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                title="Поднять на первое место — этот вариант будет показан первым"
              >
                <Star className="size-3" />
                Сделать основным
              </button>
            )}
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
            >
              <Trash2 className="size-3" />
              Удалить вариант
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor={`assoc-text-${index}`} className="text-xs">
            Текст ассоциации {index === 0 && '*'}
          </Label>
          <Textarea
            id={`assoc-text-${index}`}
            rows={4}
            value={variant.text}
            onChange={e => onChangeText(e.target.value)}
            placeholder="Pigeon — пиджн — звучит как «пиджак». Представь голубя в пиджаке..."
            required={index === 0}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`assoc-short-${index}`} className="text-xs">
            Короткое описание варианта
          </Label>
          <Input
            id={`assoc-short-${index}`}
            type="text"
            value={variant.short_description}
            onChange={e => onChangeShortDesc(e.target.value)}
            placeholder="Голубь в пиджаке"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Картинка варианта</Label>

          {preview && (
            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt={`вариант ${index + 1}`} className="h-full w-full object-cover" />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={handleClear}
                className="absolute right-2 top-2 size-7 rounded-md"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}

          {/* file input is always mounted so the chosen File survives submit */}
          <label className={cn(
            'flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-background text-center transition-colors hover:bg-muted/40',
            preview && 'hidden'
          )}>
            <Upload className="mb-2 size-5 text-muted-foreground" />
            <span className="text-xs font-medium">Загрузить картинку для варианта</span>
            <input
              ref={fileInputRef}
              type="file"
              name={`assoc[${index}][image_file]`}
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) onPickFile(file)
              }}
            />
          </label>

          {!preview && (
            <Input
              type="url"
              placeholder="…или URL картинки"
              onChange={e => onChangeUrl(e.target.value)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
