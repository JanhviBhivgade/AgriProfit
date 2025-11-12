"use client"

import { useState, useEffect } from "react"
import { Menu, DollarSign, TrendingUp } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./UserMenu"
import { Card } from "@/components/ui/card"

export function Header({ onMenuClick, user: userProp, farmName: farmNameProp }) {
  const { user: authUser, profile } = useAuth()
  
  // Use auth data if available, otherwise fall back to props
  const user = authUser || userProp
  const farmName = profile?.farm_name || farmNameProp
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalRevenue: 0,
  })

  // TODO: Fetch actual stats from Supabase
  useEffect(() => {
    // Placeholder - replace with actual data fetching
    // const fetchStats = async () => {
    //   const { data } = await supabase.rpc('get_user_stats', { user_id: user.id })
    //   setStats(data)
    // }
    // if (user) fetchStats()
  }, [user])

  const netProfit = stats.totalRevenue - stats.totalExpenses

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

        {/* Quick Stats */}
        <div className="hidden lg:flex items-center gap-4">
          <Card className="px-3 py-1.5 border-muted">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-destructive" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Expenses</span>
                <span className="text-sm font-semibold">
                  ${stats.totalExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          <Card className="px-3 py-1.5 border-muted">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Revenue</span>
                <span className="text-sm font-semibold">
                  ${stats.totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {netProfit !== 0 && (
            <Card
              className={`px-3 py-1.5 border-muted ${
                netProfit > 0 ? "bg-green-50 dark:bg-green-950" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Net</span>
                  <span
                    className={`text-sm font-semibold ${
                      netProfit > 0 ? "text-green-600 dark:text-green-400" : "text-destructive"
                    }`}
                  >
                    ${netProfit > 0 ? "+" : ""}
                    {netProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* User Menu */}
        <UserMenu user={user} farmName={farmName} />
      </div>
    </header>
  )
}

