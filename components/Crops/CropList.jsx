"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Edit, Trash2, Plus } from "lucide-react"
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
import { CropForm } from "./CropForm"
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

export function CropList() {
  const {
    crops,
    loading,
    error,
    fetchCrops,
    createCrop,
    updateCrop,
    deleteCrop,
  } = useCrops()

  const [showForm, setShowForm] = useState(false)
  const [editingCrop, setEditingCrop] = useState(null)
  const [deletingCrop, setDeletingCrop] = useState(null)

  // Fetch crops on mount
  useEffect(() => {
    fetchCrops()
  }, [fetchCrops])

  const handleCreate = async (cropData) => {
    const { error } = await createCrop(cropData)
    if (!error) {
      setShowForm(false)
    }
  }

  const handleUpdate = async (cropData) => {
    const { error } = await updateCrop(editingCrop.id, cropData)
    if (!error) {
      setEditingCrop(null)
    }
  }

  const handleDelete = async () => {
    if (deletingCrop) {
      await deleteCrop(deletingCrop.id)
      setDeletingCrop(null)
    }
  }

  const handleEdit = (crop) => {
    setEditingCrop(crop)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crops</h1>
          <p className="text-muted-foreground">
            Manage your crop inventory
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Crop
        </Button>
      </div>

      {/* Crops Table */}
      <Card>
        <CardHeader>
          <CardTitle>Crop List</CardTitle>
          <CardDescription>
            {crops.length} crop{crops.length !== 1 ? "s" : ""} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading crops...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-destructive">Error: {error}</p>
            </div>
          ) : crops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No crops found</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Crop
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crops.map((crop) => (
                    <TableRow key={crop.id}>
                      <TableCell className="font-medium">{crop.name}</TableCell>
                      <TableCell>
                        {crop.description ? (
                          <span className="text-sm text-muted-foreground">
                            {crop.description.length > 50
                              ? `${crop.description.substring(0, 50)}...`
                              : crop.description}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(crop.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(crop)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingCrop(crop)}
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
      <Dialog open={showForm || !!editingCrop} onOpenChange={(open) => {
        if (!open) {
          setShowForm(false)
          setEditingCrop(null)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCrop ? "Edit Crop" : "Add New Crop"}
            </DialogTitle>
            <DialogDescription>
              {editingCrop
                ? "Update the crop details below."
                : "Fill in the details to add a new crop to your inventory."}
            </DialogDescription>
          </DialogHeader>
          <CropForm
            crop={editingCrop}
            onSubmit={editingCrop ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false)
              setEditingCrop(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingCrop}
        onOpenChange={(open) => {
          if (!open) setDeletingCrop(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              crop "{deletingCrop?.name}". Note: This will not delete associated
              expenses or yields, but they will no longer be linked to this crop.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

