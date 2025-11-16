"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Edit, Trash2, Plus, X } from "lucide-react"
import { useYields } from "@/hooks/useYields"
import { useCrops } from "@/hooks/useCrops"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { YieldForm } from "./YieldForm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatCurrency } from "@/lib/utils"

export function YieldList() {
  const {
    yields,
    loading,
    error,
    fetchYields,
    createYield,
    updateYield,
    deleteYield,
    totalRevenue,
    totalQuantity,
  } = useYields()

  const { crops, loading: cropsLoading } = useCrops()
  const [filters, setFilters] = useState({
    cropId: "all",
    startDate: "",
    endDate: "",
  })
  const [showForm, setShowForm] = useState(false)
  const [editingYield, setEditingYield] = useState(null)
  const [deletingYield, setDeletingYield] = useState(null)

  // Fetch yields on mount and when filters change
  useEffect(() => {
    const filterParams = {
      cropId: filters.cropId !== "all" ? filters.cropId : undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    }
    fetchYields(filterParams)
  }, [filters, fetchYields])

  const handleCreate = async (yieldData) => {
    const { error } = await createYield(yieldData)
    if (!error) {
      setShowForm(false)
    }
  }

  const handleUpdate = async (yieldData) => {
    const { error } = await updateYield(editingYield.id, yieldData)
    if (!error) {
      setEditingYield(null)
    }
  }

  const handleDelete = async () => {
    if (deletingYield) {
      await deleteYield(deletingYield.id)
      setDeletingYield(null)
    }
  }

  const handleEdit = (yieldData) => {
    setEditingYield(yieldData)
  }

  const clearFilters = () => {
    setFilters({
      cropId: "all",
      startDate: "",
      endDate: "",
    })
  }

  const hasActiveFilters = filters.cropId !== "all" || filters.startDate || filters.endDate

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yields</h1>
          <p className="text-muted-foreground">
            Track your crop harvests and revenue
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Yield
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>
              {hasActiveFilters ? "Filtered total" : "All time total"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Quantity</CardTitle>
            <CardDescription>
              {hasActiveFilters ? "Filtered total" : "All time total"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalQuantity.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Records</CardTitle>
            <CardDescription>Number of yield entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{yields.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter yields by crop and date range</CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Crop</Label>
              <Select
                value={filters.cropId}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, cropId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={cropsLoading ? "Loading crops..." : undefined} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  {crops.map((crop) => (
                    <SelectItem key={crop.id} value={crop.id}>
                      {crop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yields Table */}
      <Card>
        <CardHeader>
          <CardTitle>Yield Records</CardTitle>
          <CardDescription>
            {yields.length} record{yields.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading yields...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-destructive">Error: {error}</p>
            </div>
          ) : yields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No yield records found</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Yield
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Harvest Date</TableHead>
                    <TableHead>Crop</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Sale Price</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yields.map((yieldRecord) => (
                    <TableRow key={yieldRecord.id}>
                      <TableCell>
                        {format(new Date(yieldRecord.harvest_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {yieldRecord.crops?.name || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {parseFloat(yieldRecord.quantity).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {yieldRecord.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(yieldRecord.sale_price))}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(parseFloat(yieldRecord.total_revenue))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(yieldRecord)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingYield(yieldRecord)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Form Dialog */}
      <Dialog open={showForm || !!editingYield} onOpenChange={(open) => {
        if (!open) {
          setShowForm(false)
          setEditingYield(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingYield ? "Edit Yield Record" : "Add New Yield Record"}
            </DialogTitle>
            <DialogDescription>
              {editingYield
                ? "Update the yield record details below."
                : "Fill in the details to record a new harvest."}
            </DialogDescription>
          </DialogHeader>
          <YieldForm
            yield={editingYield}
            onSubmit={editingYield ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false)
              setEditingYield(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingYield}
        onOpenChange={(open) => {
          if (!open) setDeletingYield(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              yield record for {deletingYield?.crops?.name || "this crop"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

