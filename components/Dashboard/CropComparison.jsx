"use client"

import { useMemo, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useExpenses } from "@/hooks/useExpenses"
import { useYields } from "@/hooks/useYields"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function CropComparison() {
  const { expenses, loading: expensesLoading, fetchExpenses } = useExpenses()
  const { yields, loading: yieldsLoading, fetchYields } = useYields()

  // Fetch data on mount
  useEffect(() => {
    fetchExpenses()
    fetchYields()
  }, [fetchExpenses, fetchYields])

  const loading = expensesLoading || yieldsLoading

  // Process data for comparison
  const chartData = useMemo(() => {
    if (!expenses || !yields) return []

    // Group expenses by crop
    const cropExpenses = {}
    expenses.forEach((expense) => {
      const cropId = expense.crop_id
      if (cropId) {
        const cropName = expense.crops?.name || "Unknown"
        if (!cropExpenses[cropId]) {
          cropExpenses[cropId] = {
            name: cropName,
            expenses: 0,
            revenue: 0,
          }
        }
        cropExpenses[cropId].expenses += parseFloat(expense.amount || 0)
      }
    })

    // Group yields by crop
    yields.forEach((yieldRecord) => {
      const cropId = yieldRecord.crop_id
      if (cropId) {
        const cropName = yieldRecord.crops?.name || "Unknown"
        if (!cropExpenses[cropId]) {
          cropExpenses[cropId] = {
            name: cropName,
            expenses: 0,
            revenue: 0,
          }
        }
        cropExpenses[cropId].revenue += parseFloat(yieldRecord.total_revenue || 0)
      }
    })

    // Calculate profit and convert to array
    const data = Object.entries(cropExpenses)
      .map(([id, crop]) => ({
        id,
        name: crop.name,
        expenses: crop.expenses,
        revenue: crop.revenue,
        profit: crop.revenue - crop.expenses,
      }))
      .filter((crop) => crop.expenses > 0 || crop.revenue > 0) // Only show crops with data
      .sort((a, b) => b.profit - a.profit) // Sort by profit

    return data
  }, [expenses, yields])

  // Find most and least profitable crops
  const { mostProfitable, leastProfitable } = useMemo(() => {
    if (chartData.length === 0) {
      return { mostProfitable: null, leastProfitable: null }
    }

    const profitable = chartData.filter((c) => c.profit > 0)
    const unprofitable = chartData.filter((c) => c.profit <= 0)

    return {
      mostProfitable:
        profitable.length > 0
          ? profitable.reduce((max, crop) =>
              crop.profit > max.profit ? crop : max
            )
          : null,
      leastProfitable:
        unprofitable.length > 0
          ? unprofitable.reduce((min, crop) =>
              crop.profit < min.profit ? crop : min
            )
          : null,
    }
  }, [chartData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crop Comparison</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crop Comparison: Cost vs Revenue</CardTitle>
          <CardDescription>
            Compare expenses and revenue for each crop
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No crop data available. Add expenses and yields to see comparisons.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    formatCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                  }
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value)]}
                  labelStyle={{ color: "#000" }}
                />
                <Legend />
                <Bar
                  dataKey="expenses"
                  fill="hsl(var(--destructive))"
                  name="Expenses"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  name="Revenue"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="profit"
                  fill="#22c55e"
                  name="Profit"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Most/Least Profitable Crops */}
      {(mostProfitable || leastProfitable) && (
        <div className="grid gap-4 md:grid-cols-2">
          {mostProfitable && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-900 dark:text-green-100">
                    Most Profitable Crop
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {mostProfitable.name}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="font-medium">
                        {formatCurrency(mostProfitable.revenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expenses:</span>
                      <span className="font-medium">
                        {formatCurrency(mostProfitable.expenses)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Profit:</span>
                      <span className="font-bold text-green-600">
                        {`+${formatCurrency(mostProfitable.profit)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {leastProfitable && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-red-900 dark:text-red-100">
                    Least Profitable Crop
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {leastProfitable.name}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="font-medium">
                        {formatCurrency(leastProfitable.revenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expenses:</span>
                      <span className="font-medium">
                        {formatCurrency(leastProfitable.expenses)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Profit:</span>
                      <span className="font-bold text-red-600">
                        {leastProfitable.profit >= 0
                          ? `+${formatCurrency(leastProfitable.profit)}`
                          : `-${formatCurrency(Math.abs(leastProfitable.profit))}`}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

