"use client"

import { AuthGuard } from "@/components/Auth/AuthGuard"
import { AppLayout } from "@/components/Layout/AppLayout"
import { RecentActivity } from "@/components/Dashboard/RecentActivity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TransactionsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-6 rounded-3xl border border-white/70 bg-white/90 p-8 shadow-2xl backdrop-blur-lg dark:border-white/10 dark:bg-slate-950/40">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600 mt-2">
              Review every recorded expense and yield in one place.
            </p>
          </div>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 mb-1">
                All Transactions
              </CardTitle>
              <CardDescription className="text-gray-600">
                Explore your full financial activity log.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity limit={null} />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}

