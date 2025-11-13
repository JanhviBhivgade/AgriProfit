"use client"

import { useMemo, useState, memo } from "react"
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, startOfWeek, endOfWeek, addDays } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useExpenses } from "@/hooks/useExpenses"
import { DollarSign, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export const ExpenseCalendar = memo(function ExpenseCalendar() {
  const { expenses, loading } = useExpenses()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Group expenses by date
  const expensesByDate = useMemo(() => {
    if (!expenses || expenses.length === 0) return {}

    const grouped = {}
    expenses.forEach((expense) => {
      const dateKey = format(parseISO(expense.date), "yyyy-MM-dd")
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          total: 0,
          count: 0,
          items: [],
        }
      }
      grouped[dateKey].total += parseFloat(expense.amount || 0)
      grouped[dateKey].count += 1
      grouped[dateKey].items.push(expense)
    })

    return grouped
  }, [expenses])

  // Get expense amount for a specific date
  const getExpenseForDate = (date) => {
    const dateKey = format(date, "yyyy-MM-dd")
    return expensesByDate[dateKey] || { total: 0, count: 0, items: [] }
  }

  // Get color class based on expense amount
  const getExpenseColorClass = (amount) => {
    if (amount === 0) return "bg-background border-border"
    if (amount < 50) return "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
    if (amount < 100) return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
    if (amount < 200) return "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700"
    return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
  }

  // Get text color based on expense amount
  const getTextColorClass = (amount) => {
    if (amount === 0) return "text-muted-foreground"
    if (amount < 50) return "text-green-700 dark:text-green-300"
    if (amount < 100) return "text-yellow-700 dark:text-yellow-300"
    if (amount < 200) return "text-orange-700 dark:text-orange-300"
    return "text-red-700 dark:text-red-300"
  }

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  // Get selected date expenses
  const selectedDateExpenses = useMemo(() => {
    const dateKey = format(selectedDate, "yyyy-MM-dd")
    return expensesByDate[dateKey]?.items || []
  }, [selectedDate, expensesByDate])

  // Get monthly summary
  const monthlySummary = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })

    let total = 0
    let daysWithExpenses = 0
    let maxDayExpense = 0

    days.forEach((day) => {
      const expenseData = getExpenseForDate(day)
      if (expenseData.total > 0) {
        total += expenseData.total
        daysWithExpenses += 1
        maxDayExpense = Math.max(maxDayExpense, expenseData.total)
      }
    })

    return {
      total,
      daysWithExpenses,
      totalDays: days.length,
      maxDayExpense,
      average: daysWithExpenses > 0 ? total / daysWithExpenses : 0,
    }
  }, [currentMonth, expensesByDate])

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Calendar</CardTitle>
          <CardDescription>Loading calendar data...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Expense Calendar
              </CardTitle>
              <CardDescription>
                Monthly view showing daily expense totals. Click on a date to view details.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Monthly Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Monthly Total</p>
                <p className="text-lg font-bold">
                  ${monthlySummary.total.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Days with Expenses</p>
                <p className="text-lg font-bold">
                  {monthlySummary.daysWithExpenses}/{monthlySummary.totalDays}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Daily Average</p>
                <p className="text-lg font-bold">
                  ${monthlySummary.average.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Highest Day</p>
                <p className="text-lg font-bold">
                  ${monthlySummary.maxDayExpense.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold">
                  {format(currentMonth, "MMMM yyyy")}
                </h3>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEK_DAYS.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const expenseData = getExpenseForDate(day)
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isSelected = isSameDay(day, selectedDate)
                  const isCurrentDay = isToday(day)

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "h-20 p-1 rounded-md border-2 transition-all hover:scale-105 flex flex-col items-center justify-start",
                        getExpenseColorClass(expenseData.total),
                        !isCurrentMonth && "opacity-40",
                        isSelected && "ring-2 ring-primary ring-offset-2",
                        isCurrentDay && !isSelected && "ring-1 ring-primary"
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-medium mb-1",
                          isSelected ? "text-primary font-bold" : getTextColorClass(expenseData.total),
                          !isCurrentMonth && "text-muted-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {expenseData.total > 0 && (
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            getTextColorClass(expenseData.total)
                          )}
                        >
                          ${expenseData.total.toFixed(0)}
                        </span>
                      )}
                      {expenseData.count > 1 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700" />
                <span className="text-muted-foreground">Low (&lt;$50)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700" />
                <span className="text-muted-foreground">Medium ($50-$100)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-300 dark:border-orange-700" />
                <span className="text-muted-foreground">High ($100-$200)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700" />
                <span className="text-muted-foreground">Very High (&gt;$200)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Multiple expenses</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Expense Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Daily Expenses - {format(selectedDate, "MMMM dd, yyyy")}
          </CardTitle>
          <CardDescription>
            {selectedDateExpenses.length === 0
              ? "No expenses recorded for this date"
              : `${selectedDateExpenses.length} expense${selectedDateExpenses.length !== 1 ? "s" : ""} totaling $${getExpenseForDate(selectedDate).total.toFixed(2)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDateExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No expenses recorded for {format(selectedDate, "MMMM dd, yyyy")}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Click on a date with expenses to view details
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Crop</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDateExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <span className="capitalize">{expense.category}</span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {expense.description}
                      </TableCell>
                      <TableCell>
                        {expense.crops?.name || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${parseFloat(expense.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">
                      ${getExpenseForDate(selectedDate).total.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
})
