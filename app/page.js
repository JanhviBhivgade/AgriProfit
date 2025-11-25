"use client"

import { AuthGuard } from "@/components/Auth/AuthGuard"
import { AppLayout } from "@/components/Layout/AppLayout"
import { SummaryCards } from "@/components/Dashboard/SummaryCards"
import { ProfitCalculator } from "@/components/Dashboard/ProfitCalculator"
import { ExpenseChart } from "@/components/Dashboard/ExpenseChart"
import { ExpenseByCategoryChart } from "@/components/Dashboard/ExpenseByCategoryChart"
import { CropComparison } from "@/components/Dashboard/CropComparison"
import { RecentActivity } from "@/components/Dashboard/RecentActivity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, TrendingUp } from "lucide-react"

export default function Home() {
  const currentYear = new Date().getFullYear()

  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-8 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-2xl backdrop-blur-lg dark:border-white/10 dark:bg-slate-950/40 lg:p-10">
          {/* Summary Cards - Top Row */}
          <SummaryCards />

          {/* Overview and Activity Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Overview - Expense Chart */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-1">
                      Overview
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Monthly expenses this year
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-sm font-medium">{currentYear}</span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ExpenseChart />
              </CardContent>
            </Card>

            {/* Activity - Category Chart */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 mb-1">
                  Activity
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Spending by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseByCategoryChart />
                
                {/* Month Comparison */}
                <div className="mt-6 space-y-4 pt-6 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">This month</span>
                      <span className="font-medium text-gray-900">40%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "40%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last month</span>
                      <span className="font-medium text-gray-900">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-900 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Sections */}
          <div className="grid gap-6 lg:grid-cols-2">
            <CropComparison />
            <ProfitCalculator />
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
