"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const cropSchema = z.object({
  name: z.string().min(1, "Crop name is required").max(100, "Crop name is too long"),
  description: z.string().optional().nullable(),
})

export function CropForm({ crop, onSubmit, onCancel }) {
  const { register, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(cropSchema),
    defaultValues: crop
      ? {
          name: crop.name || "",
          description: crop.description || "",
        }
      : {
          name: "",
          description: "",
        },
  })

  const submitHandler = async (values) => {
    const result = await onSubmit(values)

    if (!crop && (!result || !result.error)) {
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Crop Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Wheat, Corn, Tomatoes"
          {...register("name")}
        />
        {formState.errors.name && (
          <p className="text-sm text-destructive">{formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Add any additional details about this crop..."
          {...register("description")}
        />
        {formState.errors.description && (
          <p className="text-sm text-destructive">
            {formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={formState.isSubmitting}>
          {crop ? "Update Crop" : "Add Crop"}
        </Button>
      </div>
    </form>
  )
}

