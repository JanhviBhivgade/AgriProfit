"use client"

import { useMemo, useEffect } from "react"
import { useExpenses } from "@/hooks/useExpenses"
import { useYields } from "@/hooks/useYields"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, IndianRupee, Percent } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function ProfitCalculator() {
  const { expenses, totalExpenses, fetchExpenses } = useExpenses()
  const { yields, totalRevenue, fetchYields } = useYields()

  // Fetch data on mount
  useEffect(() => {
    fetchExpenses()
    fetchYields()
  }, [fetchExpenses, fetchYields])

  // Calculate metrics
  const metrics = useMemo(() => {
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Calculate per-crop profitability
    const cropProfitability = {}
    
    // Group expenses by crop
    expenses.forEach((expense) => {
      const cropId = expense.crop_id
      const cropName = expense.crops?.name || "Unassigned"
      
      if (!cropProfitability[cropId || "unassigned"]) {
        cropProfitability[cropId || "unassigned"] = {
          name: cropName,
          expenses: 0,
          revenue: 0,
        }
      }
      cropProfitability[cropId || "unassigned"].expenses += parseFloat(expense.amount || 0)
    })

    // Group yields by crop
    yields.forEach((yieldRecord) => {
      const cropId = yieldRecord.crop_id
      const cropName = yieldRecord.crops?.name || "Unknown"
      
      if (!cropProfitability[cropId]) {
        cropProfitability[cropId] = {
          name: cropName,
          expenses: 0,
          revenue: 0,
        }
      }
      cropProfitability[cropId].revenue += parseFloat(yieldRecord.total_revenue || 0)
    })

    // Calculate profit for each crop
    const cropProfits = Object.entries(cropProfitability).map(([id, data]) => ({
      id,
      name: data.name,
      expenses: data.expenses,
      revenue: data.revenue,
      profit: data.revenue - data.expenses,
      margin: data.revenue > 0 ? ((data.revenue - data.expenses) / data.revenue) * 100 : 0,
    }))

    // Sort by profit (most profitable first)
    cropProfits.sort((a, b) => b.profit - a.profit)

    return {
      netProfit,
      profitMargin,
      cropProfits,
    }
  }, [expenses, yields, totalExpenses, totalRevenue])

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 mb-1">
          Profit Analysis
        </CardTitle>
        <CardDescription className="text-gray-600">
          Detailed breakdown of your farm's profitability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics in Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Expenses</span>
                <IndianRupee className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Net Profit</span>
                {metrics.netProfit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              <p className={`text-2xl font-bold ${
                metrics.netProfit >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {metrics.netProfit >= 0
                  ? `+${formatCurrency(metrics.netProfit)}`
                  : `-${formatCurrency(Math.abs(metrics.netProfit))}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Revenue minus Expenses
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Profit Margin</span>
                <Percent className="h-4 w-4 text-gray-400" />
              </div>
              <p className={`text-2xl font-bold ${
                metrics.profitMargin >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {metrics.profitMargin.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Percentage of profit
              </p>
            </div>
          </div>

          {/* Per-Crop Profitability */}
          {metrics.cropProfits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profit by Crop Type
              </h3>
              <div className="space-y-3">
                {metrics.cropProfits.map((crop) => (
                  <div
                    key={crop.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🌾</span>
                        <h4 className="font-semibold text-gray-900">{crop.name}</h4>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>Spent: {formatCurrency(crop.expenses)}</span>
                        <span>Earned: {formatCurrency(crop.revenue)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xl font-bold ${
                          crop.profit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {crop.profit >= 0
                          ? `+${formatCurrency(crop.profit)}`
                          : `-${formatCurrency(Math.abs(crop.profit))}`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {crop.margin.toFixed(1)}% margin
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

