"use client"

import { Menu } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./UserMenu"
import { ExpenseCalendar } from "./ExpenseCalendar"
import { NotificationBell } from "./NotificationBell"

export function Header({ onMenuClick, user: userProp, farmName: farmNameProp }) {
  const { user: authUser, profile } = useAuth()
  
  // Use auth data if available, otherwise fall back to props
  const user = authUser || userProp
  const farmName = profile?.farm_name || farmNameProp

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-white/85 text-foreground backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:border-white/5 dark:bg-slate-900/75 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page Title */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ExpenseCalendar />
          <NotificationBell />
          <UserMenu user={user} farmName={farmName} />
        </div>
      </div>
    </header>
  )
}

