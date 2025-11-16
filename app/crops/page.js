"use client"

import { AuthGuard } from "@/components/Auth/AuthGuard"
import { AppLayout } from "@/components/Layout/AppLayout"
import { CropList } from "@/components/Crops/CropList"

export default function CropsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <CropList />
      </AppLayout>
    </AuthGuard>
  )
}
