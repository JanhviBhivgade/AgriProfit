"use client"

import { useMemo, useEffect, useState } from "react"
import { format } from "date-fns"
import { useExpenses } from "@/hooks/useExpenses"
import { useYields } from "@/hooks/useYields"
import { useCrops } from "@/hooks/useCrops"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Receipt, TrendingUp, Leaf } from "lucide-react"
import { CropForm } from "@/components/Crops/CropForm"

export function RecentActivity() {
  const { expenses, loading: expensesLoading } = useExpenses()
  const { yields, loading: yieldsLoading } = useYields()
  const { crops, createCrop, loading: cropsLoading } = useCrops()
  const [showCropDialog, setShowCropDialog] = useState(false)

  const recentExpenses = useMemo(() => {
    if (!expenses) return []
    return [...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  }, [expenses])

  const recentYields = useMemo(() => {
    if (!yields) return []
    return [...yields]
      .sort((a, b) => new Date(b.harvest_date) - new Date(a.harvest_date))
      .slice(0, 5)
  }, [yields])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <CardTitle className="text-2xl font-bold">Dashboard Overview</CardTitle>
        <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
          <DialogTrigger asChild>
            <Button>
              <Leaf className="mr-2 h-4 w-4" />
              Add Crop
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Crop</DialogTitle>
              <DialogDescription>
                Create a crop to start tracking related expenses and yields.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              <CropForm
                onSubmit={async (data) => {
                  const { error } = await createCrop(data)
                  if (!error) {
                    setShowCropDialog(false)
                  }
                  return { error }
                }}
                onCancel={() => setShowCropDialog(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Crops</CardTitle>
          <CardDescription>
            Crops you can link to expenses and yields.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cropsLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading crops...</div>
          ) : crops.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No crops added yet. Use the button above to add your first crop.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {crops.map((crop) => (
                <div
                  key={crop.id}
                  className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground"
                >
                  {crop.name}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              <CardTitle>Recent Expenses</CardTitle>
            </div>
            <CardDescription>Latest 5 expense entries</CardDescription>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : recentExpenses.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No expenses yet</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="text-sm">
                          {format(new Date(expense.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <span className="capitalize text-sm">{expense.category}</span>
                        </TableCell>
                        <TableCell className="text-sm truncate max-w-[200px]">
                          {expense.description}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{parseFloat(expense.amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>Recent Yields</CardTitle>
            </div>
            <CardDescription>Latest 5 yield entries</CardDescription>
          </CardHeader>
          <CardContent>
            {yieldsLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : recentYields.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No yields yet</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Crop</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentYields.map((yieldRecord) => (
                      <TableRow key={yieldRecord.id}>
                        <TableCell className="text-sm">
                          {format(new Date(yieldRecord.harvest_date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-sm">
                          {yieldRecord.crops?.name || "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {parseFloat(yieldRecord.quantity).toFixed(2)} {yieldRecord.unit}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{parseFloat(yieldRecord.total_revenue).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

