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
import { formatCurrency } from "@/lib/utils"

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
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading chart data...
      </div>
    )
  }

  return (
    <div>
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
                  label={({ name, value }) => {
                    const total = chartData.reduce((sum, item) => sum + item.value, 0)
                    const percentage = ((value / total) * 100).toFixed(0)
                    return `${formatCurrency(value)} ${name}`
                  }}
                  outerRadius={100}
                  innerRadius={60}
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
                <Tooltip formatter={(value) => [formatCurrency(value), "Amount"]} />
              </PieChart>
            </ResponsiveContainer>

            {/* Summary Table */}
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Category Breakdown</h4>
              <div className="space-y-2">
                {chartData.map((item, index) => {
                  const percentage = (item.value / totalExpenses) * 100
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-sm p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          {percentage.toFixed(1)}%
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

