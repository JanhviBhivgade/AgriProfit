"use client"

import { useMemo, useEffect } from "react"
import { useExpenses } from "@/hooks/useExpenses"
import { useYields } from "@/hooks/useYields"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, TrendingDown, TrendingUp, IndianRupee } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function SummaryCards() {
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
    return {
      totalBalance: netProfit, // Net profit represents the balance
      totalSpending: totalExpenses,
      totalSaved: netProfit > 0 ? netProfit : 0, // Only show positive savings
    }
  }, [totalExpenses, totalRevenue])

  const cards = [
    {
      title: "Total Balance",
      value: metrics.totalBalance,
      icon: Wallet,
      bgColor: "bg-gray-900",
      textColor: "text-white",
      iconBg: "bg-green-600",
      description: "Your farm's net profit",
    },
    {
      title: "Total Spending",
      value: metrics.totalSpending,
      icon: TrendingDown,
      bgColor: "bg-white",
      textColor: "text-gray-900",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-900",
      description: "All expenses this year",
    },
    {
      title: "Total Revenue",
      value: totalRevenue,
      icon: TrendingUp,
      bgColor: "bg-white",
      textColor: "text-gray-900",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-900",
      description: "Income from crops",
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        const isPositive = card.value >= 0
        const displayValue = card.value < 0 
          ? `-${formatCurrency(Math.abs(card.value))}` 
          : formatCurrency(card.value)

        return (
          <Card 
            key={index} 
            className={`${card.bgColor} ${card.textColor} border-0 shadow-lg relative overflow-hidden`}
          >
            <CardContent className="p-6">
              {/* Icon and menu */}
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.iconBg || "bg-green-600"} ${card.iconColor || "text-white"} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <button className="text-gray-400 hover:text-gray-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>

              {/* Value */}
              <div className="mb-2">
                <h3 className={`text-sm font-medium ${card.bgColor === "bg-gray-900" ? "text-gray-400" : "text-gray-600"} mb-1`}>
                  {card.title}
                </h3>
                <p className={`text-3xl font-bold ${isPositive ? card.textColor : "text-red-600"}`}>
                  {displayValue}
                </p>
              </div>

              {/* Description */}
              <p className={`text-xs ${card.bgColor === "bg-gray-900" ? "text-gray-400" : "text-gray-500"}`}>
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

