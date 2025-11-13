"use client"

import { AuthGuard } from "@/components/Auth/AuthGuard"
import { AppLayout } from "@/components/Layout/AppLayout"
import { ProfitCalculator } from "@/components/Dashboard/ProfitCalculator"
import { ExpenseChart } from "@/components/Dashboard/ExpenseChart"
import { ExpenseByCategoryChart } from "@/components/Dashboard/ExpenseByCategoryChart"
import { CropComparison } from "@/components/Dashboard/CropComparison"
import { RecentActivity } from "@/components/Dashboard/RecentActivity"

export default function Home() {
  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your farm operations.
            </p>
          </div>

          {/* Profit Calculator with Key Metrics */}
          <ProfitCalculator />

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ExpenseChart />
            <ExpenseByCategoryChart />
          </div>

          {/* Crop Comparison */}
          <CropComparison />

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
