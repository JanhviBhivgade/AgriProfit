"use client"

import { Menu } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./UserMenu"

export function Header({ onMenuClick, user: userProp, farmName: farmNameProp }) {
  const { user: authUser, profile } = useAuth()
  
  // Use auth data if available, otherwise fall back to props
  const user = authUser || userProp
  const farmName = profile?.farm_name || farmNameProp

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

        {/* Farm name - hidden on mobile */}
        {farmName && (
          <div className="hidden md:flex items-center">
            <h2 className="text-lg font-semibold text-foreground">
              {farmName}
            </h2>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Menu */}
        <UserMenu user={user} farmName={farmName} />
      </div>
    </header>
  )
}

