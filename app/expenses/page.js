"use client"

import { AuthGuard } from "@/components/Auth/AuthGuard"
import { AppLayout } from "@/components/Layout/AppLayout"
import { ExpenseList } from "@/components/Expenses/ExpenseList"

export default function ExpensesPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <ExpenseList />
      </AppLayout>
    </AuthGuard>
  )
}
