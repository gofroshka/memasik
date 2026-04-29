import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import UserMenu from '@/components/UserMenu'

interface NavbarProps {
  userRole?: string | null
  userEmail?: string | null
}

export default function Navbar({ userRole, userEmail }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 h-14 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-between px-4">

        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <BookOpen className="size-4" />
          </div>
          <span className="text-[15px] font-extrabold tracking-tight">Мемасик</span>
        </Link>

        <div className="flex items-center gap-2">
          {userEmail ? (
            <UserMenu userRole={userRole} userEmail={userEmail} />
          ) : (
            <Link href="/login" className={cn(buttonVariants({ size: 'sm' }), 'h-8 px-4 text-sm')}>
              Войти
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}
