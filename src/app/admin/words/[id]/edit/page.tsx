import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import WordForm from '../../WordForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getWordById } from '@/lib/repository/words'
import { withSection } from '@/lib/sections'

interface EditWordPageProps {
  params: Promise<{ id: string }>
}

export default async function EditWordPage({ params }: EditWordPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const word = await getWordById(supabase, id)
  if (!word) notFound()

  return (
    <div className="space-y-6">
      <Link
        href={withSection('/admin/words', word.section)}
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit gap-1.5 px-2 text-muted-foreground')}
      >
        <ArrowLeft className="size-3.5" />
        Назад к списку
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Редактировать: {word.word}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Обновите слово, перевод или визуальную ассоциацию.</p>
      </div>
      <WordForm word={word} />
    </div>
  )
}
