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

const th = 'px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap'
const td = 'px-3 py-2.5 align-middle'

export default function WordsTableView({ words, adding, onAddingChange }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className={th}>Слово</th>
            <th className={th}>Перевод</th>
            <th className={th}>Категория</th>
            <th className={th}>Транскрипция</th>
            <th className={th}>Учебник</th>
            <th className={th}>Фото</th>
            <th className={th}>Статус</th>
            <th className={`${th} text-right`}>Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {adding && (
            <NewWordTableRow onCancel={() => onAddingChange(false)} />
          )}
          {words.map(word => (
            <tr key={word.id} className="transition-colors hover:bg-muted/20">
              <td className={td}>
                <InlineCellEdit wordId={word.id} field="word" value={word.word} inputClassName="w-36" />
              </td>
              <td className={td}>
                <InlineCellEdit wordId={word.id} field="translation" value={word.translation} inputClassName="w-36" />
              </td>
              <td className={td}>
                <InlineCellEdit wordId={word.id} field="category" value={word.category} placeholder="—" inputClassName="w-28" />
              </td>
              <td className={td}>
                <InlineCellEdit wordId={word.id} field="transcription" value={word.transcription} placeholder="—" inputClassName="w-28" />
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
                      ? <><Eye className="size-3" /> Опубликовано</>
                      : <><EyeOff className="size-3" /> Черновик</>
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
