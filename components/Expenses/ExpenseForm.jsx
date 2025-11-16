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

const categoryKeywords = {
  seeds: ["seed"],
  fertilizers: ["fertilizer", "fertiliser", "manure", "compost"],
  pesticides: ["pesticide", "herbicide", "insecticide", "fungicide", "spray"],
  fuel: ["fuel", "diesel", "petrol", "gasoline"],
  labor: ["labor", "labour", "wage", "worker", "staff"],
  equipment: ["equipment", "tractor", "machinery", "implement", "tool", "repair"],
  water: ["water", "irrigation", "pump", "sprinkler"],
  other: [],
}

const normalizeNumber = (input) => {
  if (!input) return null
  const numeric = input.replace(/[^\d.,-]/g, "")
  if (!numeric) return null
  const lastComma = numeric.lastIndexOf(",")
  const lastDot = numeric.lastIndexOf(".")
  let normalized = numeric

  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      normalized = numeric.replace(/\./g, "").replace(",", ".")
    } else {
      normalized = numeric.replace(/,/g, "")
    }
  } else if (lastComma > -1) {
    const parts = numeric.split(",")
    if (parts[parts.length - 1].length === 2) {
      normalized = parts.slice(0, -1).join("") + "." + parts[parts.length - 1]
    } else {
      normalized = numeric.replace(/,/g, "")
    }
  }

  const value = parseFloat(normalized)
  return isNaN(value) ? null : value
}

const parseDateString = (value) => {
  if (!value) return null
  const cleaned = value.replace(/\./g, "/")

  if (/^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(cleaned)) {
    const date = new Date(cleaned)
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(cleaned)) {
    const [part1, part2, part3Raw] = cleaned.split(/[/-]/)
    const part3 = part3Raw.length === 2 ? `20${part3Raw}` : part3Raw
    const first = parseInt(part1, 10)
    const second = parseInt(part2, 10)

    let month = first
    let day = second

    if (first > 12 && second <= 12) {
      month = second
      day = first
    }

    const formatted = `${part3}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const date = new Date(formatted)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const parsed = Date.parse(cleaned)
  if (!Number.isNaN(parsed)) {
    const date = new Date(parsed)
    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

const extractExpenseData = (text) => {
  if (!text) return {}

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const lower = text.toLowerCase()

  // Amount detection
const amountRegexes = [
  /(grand\s*total|total\s*amount|amount\s*due|balance\s*due|total)\s*[:\-]?\s*([\d.,]+)/i,
  /rs\.?\s*([\d.,]+)/i,
  /₹[\s]?([\d.,]+)/i,
  /\$[\s]?([\d.,]+)/,
]

  let amount = null
  for (const regex of amountRegexes) {
    const match = text.match(regex)
    if (match?.[2] || match?.[1]) {
      amount = normalizeNumber(match[2] || match[1])
      if (amount) break
    }
  }

  if (!amount) {
    const candidates = text.match(/[\d]+[\d,]*(?:\.\d{2})?/g) || []
    if (candidates.length) {
      const numericCandidates = candidates
        .map(normalizeNumber)
        .filter((val) => typeof val === "number" && !Number.isNaN(val))
      if (numericCandidates.length) {
        amount = Math.max(...numericCandidates)
      }
    }
  }

  // Date detection
  const datePatterns = [
    /\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/,
    /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/,
    /\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b/i,
  ]

  let detectedDate = null
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match?.[0]) {
      const parsed = parseDateString(match[0])
      if (parsed) {
        detectedDate = parsed
        break
      }
    }
  }

  // Category detection
  let detectedCategory = null
  for (const cat of categories) {
    if (lower.includes(cat.value)) {
      detectedCategory = cat.value
      break
    }
  }

  if (!detectedCategory) {
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => lower.includes(keyword))) {
        detectedCategory = cat
        break
      }
    }
  }

  // Description suggestion
  const descriptionLine =
    lines.find(
      (line) =>
        line.length > 3 &&
        !/(invoice|receipt|total|amount|grand|balance|tax|date|time|bill)/i.test(line)
    ) || lines[0] || ""

  return {
    amount,
    date: detectedDate,
    category: detectedCategory,
    description: descriptionLine.slice(0, 120),
    preview: lines.slice(0, 6).join("\n"),
  }
}

export function ExpenseForm({ expense, onSubmit, onCancel }) {
  const { crops, loading: loadingCrops } = useCrops()
  const [submitting, setSubmitting] = useState(false)
  const [ocrProcessing, setOcrProcessing] = useState(false)
  const [ocrError, setOcrError] = useState(null)
  const [ocrSummary, setOcrSummary] = useState(null)
  const [billFileName, setBillFileName] = useState("")

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

  const handleBillUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setBillFileName(file.name)
    setOcrProcessing(true)
    setOcrError(null)
    setOcrSummary(null)

    try {
      const { default: Tesseract } = await import("tesseract.js")
      const result = await Tesseract.recognize(file, "eng", {
        logger: () => {},
      })

      const text = result?.data?.text

      if (!text?.trim()) {
        setOcrError("We couldn't detect any readable text in this image.")
        return
      }

      const extracted = extractExpenseData(text)
      const appliedSummary = {}

      if (extracted.description) {
        setValue("description", extracted.description, {
          shouldDirty: true,
          shouldValidate: true,
        })
        appliedSummary.description = extracted.description
      }

      if (typeof extracted.amount === "number" && !Number.isNaN(extracted.amount)) {
        setValue("amount", extracted.amount.toFixed(2), {
          shouldDirty: true,
          shouldValidate: true,
        })
        appliedSummary.amount = extracted.amount.toFixed(2)
      }

      if (extracted.date instanceof Date && !Number.isNaN(extracted.date.getTime())) {
        setValue("date", extracted.date, {
          shouldDirty: true,
          shouldValidate: true,
        })
        appliedSummary.date = format(extracted.date, "PPP")
      }

      if (extracted.category) {
        setValue("category", extracted.category, {
          shouldDirty: true,
          shouldValidate: true,
        })
        const categoryLabel = categories.find((cat) => cat.value === extracted.category)?.label
        appliedSummary.category = categoryLabel || extracted.category
      }

      if (!Object.keys(appliedSummary).length) {
        setOcrError("We couldn't extract key values automatically. Please fill the form manually.")
      } else {
        setOcrSummary({
          fileName: file.name,
          applied: appliedSummary,
          preview: extracted.preview,
        })
      }
    } catch (error) {
      console.error("Error processing bill image:", error)
      setOcrError("Something went wrong while reading the bill. Try a clearer image or re-upload.")
    } finally {
      setOcrProcessing(false)
      if (event.target) {
        event.target.value = ""
      }
    }
  }

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
          onValueChange={(value) =>
            setValue("category", value, { shouldDirty: true, shouldValidate: true })
          }
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
            setValue("crop_id", value === "none" ? null : value, {
              shouldDirty: true,
              shouldValidate: true,
            })
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

      {/* Bill Upload */}
      <div className="space-y-2">
        <Label htmlFor="bill-upload">Bill Upload (Optional)</Label>
        <Input
          id="bill-upload"
          type="file"
          accept="image/*"
          onChange={handleBillUpload}
          disabled={ocrProcessing}
        />
        <p className="text-xs text-muted-foreground">
          Upload a clear photo of your bill to auto-fill key fields. Review before saving.
        </p>
        {ocrProcessing && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Extracting details from {billFileName || "bill"}...
          </div>
        )}
        {ocrError && <p className="text-sm text-destructive">{ocrError}</p>}
        {ocrSummary && (
          <div className="rounded-md border border-muted bg-muted/40 p-3 text-xs">
            <p className="text-sm font-medium text-foreground">
              Auto-filled from {ocrSummary.fileName}
            </p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {ocrSummary.applied.amount && (
                <li>
                  <span className="font-medium text-foreground">Amount:</span> ₹{ocrSummary.applied.amount}
                </li>
              )}
              {ocrSummary.applied.date && (
                <li>
                  <span className="font-medium text-foreground">Date:</span> {ocrSummary.applied.date}
                </li>
              )}
              {ocrSummary.applied.category && (
                <li>
                  <span className="font-medium text-foreground">Category:</span>{" "}
                  {ocrSummary.applied.category}
                </li>
              )}
              {ocrSummary.applied.description && (
                <li>
                  <span className="font-medium text-foreground">Description:</span>{" "}
                  {ocrSummary.applied.description}
                </li>
              )}
            </ul>
            {ocrSummary.preview && (
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Text preview: {ocrSummary.preview}
              </p>
            )}
          </div>
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
        <Label htmlFor="amount">Amount (₹) *</Label>
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
              onSelect={(date) =>
                setValue("date", date, { shouldDirty: true, shouldValidate: true })
              }
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

