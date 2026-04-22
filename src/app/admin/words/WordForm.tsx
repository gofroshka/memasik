'use client'

import { useActionState, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Word } from '@/lib/types'
import { ImagePlus, Link2, Upload, X } from 'lucide-react'
import { saveWordAction } from '@/app/actions/words'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function WordForm({ word }: { word?: Word }) {
  const router = useRouter()
  const [error, formAction, pending] = useActionState(saveWordAction, null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imageState, setImageState] = useState<
    | { type: 'url'; url: string }
    | { type: 'file'; preview: string }
    | { type: 'none' }
  >(word?.image_url ? { type: 'url', url: word.image_url } : { type: 'none' })

  const preview = imageState.type !== 'none'
    ? (imageState.type === 'url' ? imageState.url : imageState.preview)
    : ''

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageState({ type: 'file', preview: URL.createObjectURL(file) })
  }

  function clearImage() {
    setImageState({ type: 'none' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {word?.id && <input type="hidden" name="id" value={word.id} />}
      {imageState.type === 'url' && <input type="hidden" name="image_url" value={imageState.url} />}
      {imageState.type === 'none' && <input type="hidden" name="image_url" value="" />}

      {/* Main fields */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-5 font-semibold">
          {word ? 'Редактирование карточки' : 'Новая карточка'}
        </h2>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="word">Слово *</Label>
              <Input
                id="word"
                type="text"
                name="word"
                required
                defaultValue={word?.word}
                placeholder="apple"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="translation">Перевод *</Label>
              <Input
                id="translation"
                type="text"
                name="translation"
                required
                defaultValue={word?.translation}
                placeholder="яблоко"
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="short_description">Краткое описание</Label>
            <Input
              id="short_description"
              type="text"
              name="short_description"
              defaultValue={word?.short_description ?? ''}
              placeholder="Смех — лавка"
            />
          </div>

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

          <div className="space-y-1.5">
            <Label htmlFor="description">Полный разбор *</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={6}
              defaultValue={word?.description}
              placeholder="Смех — слово звучит как «лафтер», похоже на «лавка» — представь лавку, с которой все смеются..."
            />
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ImagePlus className="size-4 text-muted-foreground" />
          <h2 className="font-semibold">Изображение</h2>
        </div>

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
