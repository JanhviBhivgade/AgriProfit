"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function AppLayout({ children, user: userProp, farmName: farmNameProp }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user: authUser, profile } = useAuth()

  // Use auth data if available, otherwise fall back to props
  const user = authUser || userProp
  const farmName = profile?.farm_name || farmNameProp

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-72">
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          farmName={farmName}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

