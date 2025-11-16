"use client"

import { useState, useEffect, useMemo } from "react"
import { Bell, X, AlertCircle } from "lucide-react"
import { useExpenses } from "@/hooks/useExpenses"
import { format, subDays, isAfter, parseISO, startOfDay } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { expenses, fetchExpenses, loading } = useExpenses()

  useEffect(() => {
    if (open) {
      fetchExpenses()
    }
    // Check for notifications every 5 minutes
    const interval = setInterval(() => {
      fetchExpenses()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [open, fetchExpenses])

  // Check for missing expense entries in the last 7 days (excluding today)
  const notifications = useMemo(() => {
    if (!expenses || loading) return []

    const today = startOfDay(new Date())
    const sevenDaysAgo = startOfDay(subDays(today, 7))
    
    // Get all dates with expenses in the last 7 days
    const datesWithExpenses = new Set()
    expenses.forEach((expense) => {
      const expenseDate = startOfDay(parseISO(expense.date))
      if (isAfter(expenseDate, sevenDaysAgo) || expenseDate.getTime() === sevenDaysAgo.getTime()) {
        datesWithExpenses.add(format(expenseDate, "yyyy-MM-dd"))
      }
    })

    // Find dates without expenses (check last 7 days, excluding today)
    const missingDates = []
    for (let i = 6; i >= 1; i--) { // Start from 1 to skip today
      const checkDate = subDays(today, i)
      const dateKey = format(checkDate, "yyyy-MM-dd")
      
      // Only check past days (not today or future)
      if (checkDate.getTime() < today.getTime() && !datesWithExpenses.has(dateKey)) {
        missingDates.push({
          date: checkDate,
          dateKey,
          message: `You forgot to add expenses on ${format(checkDate, "MMM dd, yyyy")}`,
        })
      }
    }

    // Sort by date (most recent first)
    return missingDates.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [expenses, loading])

  const hasNotifications = notifications.length > 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-gray-100 relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {hasNotifications && (
            <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-sm text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No notifications</p>
              <p className="text-xs text-gray-400 mt-1">All expenses are up to date!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.dateKey}
                  className={cn(
                    "p-3 rounded-lg border-l-4 border-yellow-500 bg-yellow-50",
                    "flex items-start gap-3"
                  )}
                >
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Missing Expense Entry
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(notification.date, "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

