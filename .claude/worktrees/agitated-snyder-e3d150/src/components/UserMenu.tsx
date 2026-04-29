"use client"

import { useTransition } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Lightbulb, LogOut } from 'lucide-react'
import { signOutAction } from '@/app/actions/auth'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface UserMenuProps {
  userRole?: string | null
  userEmail: string
}

export default function UserMenu({ userRole, userEmail }: UserMenuProps) {
  const [pending, startTransition] = useTransition()
  const initial = userEmail[0].toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus:outline-none">
        {initial}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-[min(calc(100vw-1rem),17rem)] overflow-hidden p-0">

        {/* Profile header */}
        <div className="flex items-center gap-3 bg-muted/50 px-4 py-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow-sm">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{userEmail.split('@')[0]}</p>
            <p className="truncate text-xs text-muted-foreground leading-tight mt-0.5">{userEmail}</p>
          </div>
        </div>

        <DropdownMenuSeparator className="my-0" />

        <div className="p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLinkItem render={<Link href="/suggest" />} closeOnClick className="gap-3 rounded-lg px-3 py-2.5">
              <Lightbulb className="size-4 shrink-0 text-muted-foreground" />
              <span>Предложить идею</span>
            </DropdownMenuLinkItem>

            {userRole === 'admin' && (
              <DropdownMenuLinkItem render={<Link href="/admin" />} closeOnClick className="gap-3 rounded-lg px-3 py-2.5">
                <LayoutDashboard className="size-4 shrink-0 text-muted-foreground" />
                <span>Панель администратора</span>
              </DropdownMenuLinkItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1.5" />

          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer gap-3 rounded-lg px-3 py-2.5"
              disabled={pending}
              onClick={() => startTransition(() => signOutAction())}
            >
              <LogOut className="size-4 shrink-0" />
              <span>Выйти</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
