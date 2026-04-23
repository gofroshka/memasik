'use client'

import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { togglePublishAction } from '@/app/actions/words'
import { cn } from '@/lib/utils'
import { Word } from '@/lib/types'
import InlineCellEdit from './InlineCellEdit'
import TextbookInlineEdit from './TextbookInlineEdit'
import ImageInlineEdit from './ImageInlineEdit'
import DeleteWordButton from './DeleteWordButton'
import NewWordTableRow from './NewWordTableRow'

interface Props {
  words: Word[]
  adding: boolean
  onAddingChange: (v: boolean) => void
}

const th = 'px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap'
const td = 'px-4 py-3 align-top'

export default function WordsTableView({ words, adding, onAddingChange }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="min-w-max w-full text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className={th} style={{minWidth: 140}}>Слово</th>
            <th className={th} style={{minWidth: 160}}>Перевод</th>
            <th className={th} style={{minWidth: 130}}>Категория</th>
            <th className={th} style={{minWidth: 140}}>Транскрипция</th>
            <th className={th} style={{minWidth: 200}}>Описание</th>
            <th className={th} style={{minWidth: 180}}>Короткое описание</th>
            <th className={th} style={{minWidth: 200}}>Анализ</th>
            <th className={th} style={{minWidth: 160}}>Учебник</th>
            <th className={th} style={{minWidth: 100}}>Фото</th>
            <th className={th} style={{minWidth: 140}}>Статус</th>
            <th className={`${th} text-right`} style={{minWidth: 60}}>Удалить</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {adding && (
            <NewWordTableRow onCancel={() => onAddingChange(false)} />
          )}
          {words.map(word => (
            <tr key={word.id} className="transition-colors hover:bg-muted/20">
              <td className={td}>
                <InlineCellEdit wordId={word.id} field="word" value={word.word} inputClassName="w-[130px]" />
              </td>
              <td className={td}>
                <InlineCellEdit wordId={word.id} field="translation" value={word.translation} inputClassName="w-[150px]" />
              </td>
              <td className={td}>
                <InlineCellEdit wordId={word.id} field="category" value={word.category} placeholder="—" inputClassName="w-[120px]" />
              </td>
              <td className={td}>
                <InlineCellEdit wordId={word.id} field="transcription" value={word.transcription} placeholder="—" inputClassName="w-[130px]" />
              </td>
              <td className={td}>
                <InlineCellEdit wordId={word.id} field="description" value={word.description} placeholder="—" inputClassName="w-[340px]" multiline />
              </td>
              <td className={td}>
                <InlineCellEdit wordId={word.id} field="short_description" value={word.short_description} placeholder="—" inputClassName="w-[300px]" multiline />
              </td>
              <td className={td}>
                <InlineCellEdit wordId={word.id} field="full_analysis" value={word.full_analysis} placeholder="—" inputClassName="w-[380px]" multiline />
              </td>
              <td className={td}>
                <TextbookInlineEdit
                  wordId={word.id}
                  textbookClass={word.textbook_class}
                  textbookPart={word.textbook_part}
                  textbookPage={word.textbook_page}
                />
              </td>
              <td className={td}>
                <ImageInlineEdit
                  wordId={word.id}
                  imageUrl={word.image_url}
                  wordName={word.word}
                />
              </td>
              <td className={td}>
                <form action={togglePublishAction}>
                  <input type="hidden" name="id" value={word.id} />
                  <input type="hidden" name="is_published" value={String(word.is_published)} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className={cn(
                      'gap-1.5 text-xs',
                      word.is_published ? 'border-green-500/30 text-green-600' : 'text-muted-foreground'
                    )}
                  >
                    {word.is_published
                      ? <><Eye className="size-3" /> Опубл.</>
                      : <><EyeOff className="size-3" /> Черн.</>
                    }
                  </Button>
                </form>
              </td>
              <td className={`${td} text-right`}>
                <DeleteWordButton wordId={word.id} wordName={word.word} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
