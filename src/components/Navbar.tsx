import Link from 'next/link'
import { BookOpen, Lightbulb, LogOut, Shield } from 'lucide-react'
import { signOutAction } from '@/app/actions/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
          {userEmail && (
            <Link
              href="/suggest"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5 text-xs')}
            >
              <Lightbulb className="size-3" />
              Предложить
            </Link>
          )}
          {userRole === 'admin' && (
            <Link
              href="/admin"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5 text-xs')}
            >
              <Shield className="size-3" />
              Панель
            </Link>
          )}

          {userEmail ? (
            <>
              <span className="hidden max-w-[140px] truncate text-xs text-muted-foreground sm:block">
                {userEmail}
              </span>
              <form action={signOutAction}>
                <Button
                  variant="ghost"
                  size="sm"
                  type="submit"
                  className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="size-3.5" />
                  <span className="hidden sm:inline">Выйти</span>
                </Button>
              </form>
            </>
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
