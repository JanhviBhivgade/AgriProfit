"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useExpenses } from "@/hooks/useExpenses"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"

export function ExpenseCalendar() {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { expenses, fetchExpenses, loading } = useExpenses()

  useEffect(() => {
    if (open) {
      fetchExpenses()
    }
  }, [open, fetchExpenses])

  // Group expenses by date
  const expensesByDate = useMemo(() => {
    if (!expenses || expenses.length === 0) return {}
    
    const grouped = {}
    expenses.forEach((expense) => {
      const dateKey = format(parseISO(expense.date), "yyyy-MM-dd")
      if (!grouped[dateKey]) {
        grouped[dateKey] = 0
      }
      grouped[dateKey] += parseFloat(expense.amount || 0)
    })
    return grouped
  }, [expenses])

  // Get all days in the current month
  const currentMonth = useMemo(() => {
    const start = startOfMonth(selectedDate)
    const end = endOfMonth(selectedDate)
    return eachDayOfInterval({ start, end })
  }, [selectedDate])

  // Get previous month
  const goToPreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))
  }

  // Get next month
  const goToNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))
  }

  // Get expense for a specific date
  const getExpenseForDate = (date) => {
    const dateKey = format(date, "yyyy-MM-dd")
    return expensesByDate[dateKey] || 0
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-gray-100 relative">
          <CalendarIcon className="h-5 w-5 text-gray-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {format(selectedDate, "MMMM yyyy")}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-600 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startOfMonth(selectedDate).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[70px]" />
            ))}

            {/* Days of month */}
            {currentMonth.map((day) => {
              const expense = getExpenseForDate(day)
              const isToday = isSameDay(day, new Date())
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "p-2 min-h-[70px] border rounded-md flex flex-col cursor-pointer hover:bg-gray-50 transition-colors",
                    isToday && "border-green-600 bg-green-50 ring-2 ring-green-200",
                    expense > 0 && !isToday && "border-gray-200 bg-gray-50"
                  )}
                  title={expense > 0 ? `Expenses on ${format(day, "MMM dd")}: ${formatCurrency(expense)}` : `No expenses on ${format(day, "MMM dd")}`}
                >
                  <span
                    className={cn(
                      "text-sm font-semibold mb-1",
                      isToday && "text-green-700",
                      !isToday && expense > 0 && "text-gray-900",
                      !isToday && expense === 0 && "text-gray-500"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {expense > 0 && (
                    <div className="mt-auto">
                      <span className="text-xs font-bold text-green-700 leading-tight block">
                        {formatCurrency(expense)}
                      </span>
                    </div>
                  )}
                  {expense === 0 && !isToday && (
                    <div className="mt-auto">
                      <span className="text-xs text-gray-400">-</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Summary */}
          {loading ? (
            <div className="mt-4 text-center text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Total expenses this month:{" "}
                <span className="font-semibold text-gray-900">
                  {formatCurrency(
                    Object.values(expensesByDate).reduce((sum, amount) => sum + amount, 0)
                  )}
                </span>
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

