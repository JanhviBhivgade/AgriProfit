"use client"

import { useMemo, useEffect } from "react"
import { useExpenses } from "@/hooks/useExpenses"
import { useYields } from "@/hooks/useYields"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react"

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
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${totalExpenses.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${totalRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            {metrics.netProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                metrics.netProfit >= 0 ? "text-green-600" : "text-destructive"
              }`}
            >
              ${metrics.netProfit >= 0 ? "+" : ""}
              {metrics.netProfit.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue - Expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                metrics.profitMargin >= 0 ? "text-green-600" : "text-destructive"
              }`}
            >
              {metrics.profitMargin.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              (Net Profit / Revenue) × 100
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-Crop Profitability */}
      {metrics.cropProfits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Profitability by Crop</CardTitle>
            <CardDescription>
              Breakdown of expenses, revenue, and profit per crop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.cropProfits.map((crop) => (
                <div
                  key={crop.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{crop.name}</h4>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Expenses: ${crop.expenses.toFixed(2)}</span>
                      <span>Revenue: ${crop.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${
                        crop.profit >= 0 ? "text-green-600" : "text-destructive"
                      }`}
                    >
                      {crop.profit >= 0 ? "+" : ""}
                      ${crop.profit.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Margin: {crop.margin.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

