import { LogOut } from 'lucide-react'
import { signOutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default function AdminSignOut({ iconOnly }: { iconOnly?: boolean }) {
  return (
    <form action={signOutAction}>
      {iconOnly ? (
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="size-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sm font-normal text-muted-foreground hover:text-destructive"
        >
          <LogOut className="size-4" />
          Выйти
        </Button>
      )}
    </form>
  )
}
