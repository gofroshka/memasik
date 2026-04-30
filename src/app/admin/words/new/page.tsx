import WordForm from '../WordForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { parseSection, sectionMeta, withSection } from '@/lib/sections'

interface NewWordPageProps {
  searchParams: Promise<{ section?: string }>
}

export default async function NewWordPage({ searchParams }: NewWordPageProps) {
  const params = await searchParams
  const section = parseSection(params.section)
  const meta = sectionMeta(section)
  const backHref = withSection('/admin/words', section)

  return (
    <div className="space-y-6">
      <Link href={backHref} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit gap-1.5 px-2 text-muted-foreground')}>
        <ArrowLeft className="size-3.5" />
        Назад к списку
      </Link>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">{meta.emoji} {meta.title}</p>
        <h1 className="text-2xl font-bold">Новое слово</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Создайте карточку с переводом, описанием и изображением.
        </p>
      </div>
      <WordForm section={section} />
    </div>
  )
}
