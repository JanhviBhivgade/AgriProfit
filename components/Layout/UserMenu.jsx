"use client"

import { useState } from "react"
import { 
  User, 
  LogOut, 
  ChevronDown
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function UserMenu({ user: userProp, farmName: farmNameProp }) {
  const [open, setOpen] = useState(false)
  const { user: authUser, profile, signOut } = useAuth()

  // Use auth data if available, otherwise fall back to props
  const user = authUser || userProp
  const farmName = profile?.farm_name || farmNameProp

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || "User"
  const displayEmail = user?.email || ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 h-auto py-2 px-3 hover:bg-gray-100 rounded-lg"
        >
          <Avatar className="h-9 w-9 border-2 border-green-600">
            <AvatarFallback className="bg-green-600 text-white text-sm">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-semibold text-gray-900">
              {displayName}
            </span>
            {farmName && (
              <span className="text-xs text-gray-600">{farmName}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 shadow-lg border-gray-200" align="end">
        <div className="p-2">
          <div className="px-3 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-600 truncate mt-1">
              {displayEmail}
            </p>
            {farmName && (
              <p className="text-xs text-gray-500 mt-1">
                {farmName}
              </p>
            )}
          </div>
          <div className="py-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

