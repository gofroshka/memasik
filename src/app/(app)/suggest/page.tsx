import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SuggestForm from './SuggestForm'

interface SuggestPageProps {
  searchParams: Promise<{ success?: string }>
}

export default async function SuggestPage({ searchParams }: SuggestPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { success } = await searchParams

  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-extrabold">Предложить ассоциацию</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Придумали крутую мнемонику? Поделитесь — возможно, она появится в библиотеке.
        </p>
      </div>

      {success === '1' ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/8 p-5 text-sm text-green-700">
          Спасибо! Ваше предложение отправлено на проверку.{' '}
          <a href="/suggest" className="underline underline-offset-2">Отправить ещё</a>
        </div>
      ) : (
        <SuggestForm />
      )}
    </div>
  )
}
