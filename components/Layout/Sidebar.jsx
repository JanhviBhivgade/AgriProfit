"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  BarChart3, 
  Sparkles,
  X,
  Settings,
  Moon,
  Sun
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { ThemeToggle } from "./ThemeToggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Yields", href: "/yields", icon: TrendingUp },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "AI Crop Planner", href: "/ai-crop-planner", icon: Sparkles },
]

export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname()
  const { profile } = useAuth()

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "👨‍🌾"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = profile?.full_name || "Farmer"

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo and close button */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-800">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
                <span className="text-2xl">🌾</span>
              </div>
              <span className="text-xl font-bold text-white">AgriProfit</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation - MANAGE Section */}
          <nav className="flex-1 space-y-2 px-4 py-6">
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                MANAGE
              </p>
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== "/" && pathname?.startsWith(item.href))
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        // Close mobile menu on navigation
                        if (window.innerWidth < 1024) {
                          onClose()
                        }
                      }}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isActive && "text-green-500")} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* PREFERENCES Section */}
            <div className="mt-8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                PREFERENCES
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
                  <div className="flex items-center space-x-3">
                    <Moon className="h-5 w-5" />
                    <span className="text-sm font-medium">Theme</span>
                  </div>
                  <ThemeToggle variant="switch" />
                </div>
              </div>
            </div>
          </nav>

          {/* User Profile Footer */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Avatar className="h-10 w-10 border-2 border-green-600">
                <AvatarFallback className="bg-green-600 text-white text-sm">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {profile?.farm_name || "Farmer"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

