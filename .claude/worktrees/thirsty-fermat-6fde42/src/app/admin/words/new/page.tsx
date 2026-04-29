import WordForm from '../WordForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NewWordPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/words" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit gap-1.5 px-2 text-muted-foreground')}>
        <ArrowLeft className="size-3.5" />
        Назад к списку
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Новое слово</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Создайте карточку с переводом, описанием и изображением.
        </p>
      </div>
      <WordForm />
    </div>
  )
}
