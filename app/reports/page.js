"use client"

import { AuthGuard } from "@/components/Auth/AuthGuard"
import { AppLayout } from "@/components/Layout/AppLayout"
import { ReportGenerator } from "@/components/Reports/ReportGenerator"
import { useAuth } from "@/hooks/useAuth"

export default function ReportsPage() {
  const { profile } = useAuth()
  const farmName = profile?.farm_name || "Farm"

  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Generate professional reports for your farm operations
            </p>
          </div>

          {/* Report Generator */}
          <ReportGenerator farmName={farmName} />
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
