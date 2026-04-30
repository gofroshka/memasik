import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SuggestForm from './SuggestForm'
import { parseSection, sectionMeta, withSection } from '@/lib/sections'

interface SuggestPageProps {
  searchParams: Promise<{ success?: string; section?: string }>
}

export default async function SuggestPage({ searchParams }: SuggestPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const params = await searchParams
  const section = parseSection(params.section)
  const meta = sectionMeta(section)
  const success = params.success
  const suggestHref = withSection('/suggest', section)

  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 py-10">
      <div>
        <p className="mb-1 text-xs text-muted-foreground">
          {meta.emoji} {meta.title}
        </p>
        <h1 className="text-2xl font-extrabold">Предложить ассоциацию</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Придумали крутую мнемонику? Поделитесь — возможно, она появится в библиотеке.
        </p>
      </div>

      {success === '1' ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/8 p-5 text-sm text-green-700">
          Спасибо! Ваше предложение отправлено на проверку.{' '}
          <a href={suggestHref} className="underline underline-offset-2">Отправить ещё</a>
        </div>
      ) : (
        <SuggestForm section={section} meta={meta} />
      )}
    </div>
  )
}
