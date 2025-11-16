"use client"

import { AuthGuard } from "@/components/Auth/AuthGuard"
import { AppLayout } from "@/components/Layout/AppLayout"
import { AICropPlannerForm } from "@/components/AICropPlanner/AICropPlannerForm"

export default function AICropPlannerPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Crop Planner</h1>
            <p className="text-muted-foreground">
              Get expert crop planning and budget estimation powered by AI.
            </p>
          </div>
          <AICropPlannerForm />
        </div>
      </AppLayout>
    </AuthGuard>
  )
}

