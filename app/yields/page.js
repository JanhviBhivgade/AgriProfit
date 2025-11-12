"use client"

import { AuthGuard } from "@/components/Auth/AuthGuard"
import { AppLayout } from "@/components/Layout/AppLayout"
import { YieldList } from "@/components/Yields/YieldList"

export default function YieldsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <YieldList />
      </AppLayout>
    </AuthGuard>
  )
}
