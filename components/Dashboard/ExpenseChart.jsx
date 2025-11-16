"use client"

import { useMemo, useState, useEffect } from "react"
import { format, subDays, startOfDay, parseISO } from "date-fns"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useExpenses } from "@/hooks/useExpenses"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function ExpenseChart() {
  const { expenses, loading, fetchExpenses } = useExpenses()

  // Fetch data on mount
  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd")
  )
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"))

  // Process data for chart
  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) return []

    // Filter by date range
    const filtered = expenses.filter((expense) => {
      const expenseDate = parseISO(expense.date)
      const start = parseISO(startDate)
      const end = parseISO(endDate)
      return expenseDate >= start && expenseDate <= end
    })

    // Group by date and sum amounts
    const grouped = {}
    filtered.forEach((expense) => {
      const dateKey = format(parseISO(expense.date), "yyyy-MM-dd")
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: format(parseISO(expense.date), "MMM dd"),
          amount: 0,
        }
      }
      grouped[dateKey].amount += parseFloat(expense.amount || 0)
    })

    // Convert to array and sort by date
    const data = Object.values(grouped).sort((a, b) => {
      return new Date(a.date) - new Date(b.date)
    })

    return data
  }, [expenses, startDate, endDate])

  const handleReset = () => {
    setStartDate(format(subDays(new Date(), 30), "yyyy-MM-dd"))
    setEndDate(format(new Date(), "yyyy-MM-dd"))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading chart data...
      </div>
    )
  }

  return (
    <div>
        {/* Date Range Filter */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button variant="outline" onClick={handleReset} className="w-full">
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Chart */}
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No expense data available for the selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  formatCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                }
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), "Amount"]}
                labelStyle={{ color: "#000" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                name="Expenses"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
    </div>
  )
}

