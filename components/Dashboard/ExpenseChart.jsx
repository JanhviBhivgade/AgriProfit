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
      <Card>
        <CardHeader>
          <CardTitle>Expenses Over Time</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Expenses Over Time</CardTitle>
            <CardDescription>
              Track your expense trends over a selected period
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip
                formatter={(value) => [
                  `$${parseFloat(value).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
                  "Amount",
                ]}
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
      </CardContent>
    </Card>
  )
}

