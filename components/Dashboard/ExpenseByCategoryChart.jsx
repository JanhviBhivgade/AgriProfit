"use client"

import { useMemo, useEffect } from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { useExpenses } from "@/hooks/useExpenses"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--muted))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
]

const CATEGORY_LABELS = {
  seeds: "Seeds",
  fertilizers: "Fertilizers",
  pesticides: "Pesticides",
  fuel: "Fuel",
  labor: "Labor",
  equipment: "Equipment",
  water: "Water",
  other: "Other",
}

export function ExpenseByCategoryChart() {
  const { expenses, loading, fetchExpenses } = useExpenses()

  // Fetch data on mount
  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Process data for pie chart
  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) return []

    // Group by category
    const grouped = {}
    expenses.forEach((expense) => {
      const category = expense.category
      if (!grouped[category]) {
        grouped[category] = {
          name: CATEGORY_LABELS[category] || category,
          value: 0,
        }
      }
      grouped[category].value += parseFloat(expense.amount || 0)
    })

    // Convert to array and sort by value (descending)
    const data = Object.values(grouped).sort((a, b) => b.value - a.value)

    return data
  }, [expenses])

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>
          Breakdown of expenses by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No expense data available
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `$${parseFloat(value).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`,
                    "Amount",
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {/* Summary Table */}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold">Category Breakdown</h4>
              <div className="space-y-1">
                {chartData.map((item, index) => {
                  const percentage = (item.value / totalExpenses) * 100
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                        <span className="font-medium">
                          ${item.value.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

