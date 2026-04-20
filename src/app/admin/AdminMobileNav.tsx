'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, LayoutDashboard, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function AdminMobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/admin', label: 'Обзор', icon: LayoutDashboard, exact: true },
    { href: '/admin/words', label: 'Слова', icon: BookOpen, exact: false },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-border bg-card md:hidden">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        )
      })}
      <button
        onClick={signOut}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <LogOut className="size-5" />
        Выйти
      </button>
    </nav>
  )
}
