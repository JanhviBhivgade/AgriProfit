"use client"

import { AuthGuard } from "@/components/Auth/AuthGuard"
import { AppLayout } from "@/components/Layout/AppLayout"
import { ExpenseCalendar } from "@/components/Dashboard/ExpenseCalendar"

export default function ExpenseCalendarPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expense Calendar</h1>
            <p className="text-muted-foreground">
              View your daily expenses across the month.
            </p>
          </div>
          <ExpenseCalendar />
        </div>
      </AppLayout>
    </AuthGuard>
  )
}


