'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DeleteWordButton({ wordId, wordName }: { wordId: string; wordName: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Удалить слово «${wordName}»?`)) return
    setLoading(true)
    await supabase.from('words').delete().eq('id', wordId)
    router.refresh()
  }

  return (
    <Button
      onClick={handleDelete}
      disabled={loading}
      variant="ghost"
      size="icon-sm"
      className="rounded-xl text-destructive/70 hover:text-destructive"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
