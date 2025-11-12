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
import { cn } from "@/lib/utils"
import { useCrops } from "@/hooks/useCrops"

const expenseSchema = z.object({
  category: z.enum(["seeds", "fertilizers", "pesticides", "fuel", "labor", "equipment", "water", "other"], {
    required_error: "Please select a category",
  }),
  crop_id: z.string().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  amount: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0
  }, "Amount must be a positive number"),
  date: z.date({
    required_error: "Date is required",
  }),
  quantity: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
})

const categories = [
  { value: "seeds", label: "Seeds" },
  { value: "fertilizers", label: "Fertilizers" },
  { value: "pesticides", label: "Pesticides" },
  { value: "fuel", label: "Fuel" },
  { value: "labor", label: "Labor" },
  { value: "equipment", label: "Equipment" },
  { value: "water", label: "Water" },
  { value: "other", label: "Other" },
]

export function ExpenseForm({ expense, onSubmit, onCancel }) {
  const { crops, loading: loadingCrops } = useCrops()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          category: expense.category,
          crop_id: expense.crop_id || null,
          description: expense.description,
          amount: expense.amount?.toString() || "",
          date: expense.date ? new Date(expense.date) : new Date(),
          quantity: expense.quantity?.toString() || "",
          unit: expense.unit || "",
        }
      : {
          category: undefined,
          crop_id: null,
          description: "",
          amount: "",
          date: new Date(),
          quantity: "",
          unit: "",
        },
  })

  const selectedDate = watch("date")
  const selectedCategory = watch("category")
  const selectedCropId = watch("crop_id")

  const onFormSubmit = async (data) => {
    setSubmitting(true)
    try {
      const expenseData = {
        category: data.category,
        crop_id: data.crop_id || null,
        description: data.description,
        amount: parseFloat(data.amount),
        date: format(data.date, "yyyy-MM-dd"),
        quantity: data.quantity ? parseFloat(data.quantity) : null,
        unit: data.unit || null,
      }

      await onSubmit(expenseData)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setValue("category", value)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* Crop */}
      <div className="space-y-2">
        <Label htmlFor="crop_id">Crop (Optional)</Label>
        <Select
          value={selectedCropId ?? "none"}
          onValueChange={(value) =>
            setValue("crop_id", value === "none" ? null : value)
          }
          disabled={loadingCrops}
        >
          <SelectTrigger id="crop_id">
            <SelectValue placeholder={loadingCrops ? "Loading..." : "Select crop (optional)"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {crops.map((crop) => (
              <SelectItem key={crop.id} value={crop.id}>
                {crop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!loadingCrops && crops.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No crops found. Add a crop first to link expenses.
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          {...register("description")}
          placeholder="Enter expense description"
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount ($) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          {...register("amount")}
          placeholder="0.00"
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label>Date *</Label>
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
              onSelect={(date) => setValue("date", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-destructive">{errors.date.message}</p>
        )}
      </div>

      {/* Quantity and Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity (Optional)</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            min="0"
            {...register("quantity")}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit (Optional)</Label>
          <Input
            id="unit"
            {...register("unit")}
            placeholder="kg, L, etc."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : expense ? (
            "Update Expense"
          ) : (
            "Add Expense"
          )}
        </Button>
      </div>
    </form>
  )
}

