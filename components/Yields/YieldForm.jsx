"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, formatCurrency } from "@/lib/utils"
import { useCrops } from "@/hooks/useCrops"

const yieldSchema = z.object({
  crop_id: z.string().min(1, "Please select a crop"),
  quantity: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0
  }, "Quantity must be a positive number"),
  unit: z.string().min(1, "Unit is required"),
  sale_price: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num >= 0
  }, "Sale price must be a non-negative number"),
  harvest_date: z.date({
    required_error: "Harvest date is required",
  }),
})

export function YieldForm({ yield: yieldData, onSubmit, onCancel }) {
  const { crops, loading: loadingCrops } = useCrops()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(yieldSchema),
    defaultValues: yieldData
      ? {
          crop_id: yieldData.crop_id,
          quantity: yieldData.quantity?.toString() || "",
          unit: yieldData.unit || "",
          sale_price: yieldData.sale_price?.toString() || "",
          harvest_date: yieldData.harvest_date ? new Date(yieldData.harvest_date) : new Date(),
        }
      : {
          crop_id: null,
          quantity: "",
          unit: "",
          sale_price: "",
          harvest_date: new Date(),
        },
  })

  const selectedDate = watch("harvest_date")
  const selectedCropId = watch("crop_id")
  const quantity = watch("quantity")
  const salePrice = watch("sale_price")

  // Calculate total revenue
  const totalRevenue = (() => {
    const qty = parseFloat(quantity) || 0
    const price = parseFloat(salePrice) || 0
    return qty * price
  })()


  const onFormSubmit = async (data) => {
    setSubmitting(true)
    try {
      const yieldFormData = {
        crop_id: data.crop_id,
        quantity: parseFloat(data.quantity),
        unit: data.unit,
        sale_price: parseFloat(data.sale_price),
        harvest_date: format(data.harvest_date, "yyyy-MM-dd"),
      }

      await onSubmit(yieldFormData)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Crop Selection */}
      <div className="space-y-2">
        <Label htmlFor="crop_id">Crop *</Label>
        <Select
          value={selectedCropId ?? "none"}
          onValueChange={(value) =>
            setValue("crop_id", value === "none" ? null : value)
          }
          disabled={loadingCrops}
        >
          <SelectTrigger id="crop_id">
            <SelectValue placeholder={loadingCrops ? "Loading crops..." : "Select crop"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select a crop</SelectItem>
            {crops.map((crop) => (
              <SelectItem key={crop.id} value={crop.id}>
                {crop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!loadingCrops && crops.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No crops found. Add a crop first to record yields.
          </p>
        )}
        {errors.crop_id && (
          <p className="text-sm text-destructive">{errors.crop_id.message}</p>
        )}
        {crops.length === 0 && !loadingCrops && (
          <p className="text-sm text-muted-foreground">
            No crops found. Please add a crop first.
          </p>
        )}
      </div>

      {/* Quantity and Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            min="0"
            {...register("quantity")}
            placeholder="0.00"
          />
          {errors.quantity && (
            <p className="text-sm text-destructive">{errors.quantity.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Input
            id="unit"
            {...register("unit")}
            placeholder="kg, tons, bags, etc."
          />
          {errors.unit && (
            <p className="text-sm text-destructive">{errors.unit.message}</p>
          )}
        </div>
      </div>

      {/* Sale Price */}
      <div className="space-y-2">
        <Label htmlFor="sale_price">Sale Price per Unit (₹) *</Label>
        <Input
          id="sale_price"
          type="number"
          step="0.01"
          min="0"
          {...register("sale_price")}
          placeholder="0.00"
        />
        {errors.sale_price && (
          <p className="text-sm text-destructive">{errors.sale_price.message}</p>
        )}
      </div>

      {/* Harvest Date */}
      <div className="space-y-2">
        <Label>Harvest Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setValue("harvest_date", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.harvest_date && (
          <p className="text-sm text-destructive">{errors.harvest_date.message}</p>
        )}
      </div>

      {/* Total Revenue Preview */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {quantity || 0} {watch("unit") || "units"} × ₹{salePrice || "0.00"} per unit
          </p>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting || loadingCrops}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : yieldData ? (
            "Update Yield"
          ) : (
            "Add Yield"
          )}
        </Button>
      </div>
    </form>
  )
}

