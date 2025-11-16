"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AICropPlannerResult } from "./AICropPlannerResult"

const cropPlannerSchema = z.object({
  arable_area: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0
  }, "Arable land area must be a positive number"),
  unit: z.string().min(1, "Unit is required"),
  location: z.string().min(1, "Location is required"),
  crop_name: z.string().min(1, "Desired crop is required"),
  season: z.string().min(1, "Planting season is required"),
  budget_constraint: z.string().min(1, "Budget constraint is required"),
  specific_goals: z.string().optional(),
})

export function AICropPlannerForm() {
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(cropPlannerSchema),
    defaultValues: {
      arable_area: "",
      unit: "acres",
      location: "",
      crop_name: "",
      season: "",
      budget_constraint: "",
      specific_goals: "",
    },
  })

  const unit = watch("unit")
  const season = watch("season")

  const onSubmit = async (data) => {
    setSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/ai-crop-planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate crop plan")
      }

      const resultData = await response.json()
      setResult(resultData)
    } catch (err) {
      setError(err.message || "An error occurred while generating the crop plan")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Crop Planning Form
          </CardTitle>
          <CardDescription>
            Fill in the details below to get an AI-powered crop plan and budget estimation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Arable Land Area */}
              <div className="space-y-2">
                <Label htmlFor="arable_area">Arable Land Area *</Label>
                <div className="flex gap-2">
                  <Input
                    id="arable_area"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 10"
                    {...register("arable_area")}
                  />
                  <Select
                    value={unit}
                    onValueChange={(value) =>
                      setValue("unit", value, { shouldDirty: true, shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acres">Acres</SelectItem>
                      <SelectItem value="hectares">Hectares</SelectItem>
                      <SelectItem value="square_meters">Square Meters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.arable_area && (
                  <p className="text-sm text-destructive">{errors.arable_area.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., California, USA"
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>

              {/* Desired Crop */}
              <div className="space-y-2">
                <Label htmlFor="crop_name">Desired Crop *</Label>
                <Input
                  id="crop_name"
                  placeholder="e.g., Wheat, Corn, Tomatoes"
                  {...register("crop_name")}
                />
                {errors.crop_name && (
                  <p className="text-sm text-destructive">{errors.crop_name.message}</p>
                )}
              </div>

              {/* Planting Season */}
              <div className="space-y-2">
                <Label htmlFor="season">Planting Season *</Label>
                <Select
                  value={season}
                  onValueChange={(value) =>
                    setValue("season", value, { shouldDirty: true, shouldValidate: true })
                  }
                >
                  <SelectTrigger id="season">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                    <SelectItem value="fall">Fall</SelectItem>
                    <SelectItem value="winter">Winter</SelectItem>
                    <SelectItem value="year-round">Year-round</SelectItem>
                  </SelectContent>
                </Select>
                {errors.season && (
                  <p className="text-sm text-destructive">{errors.season.message}</p>
                )}
              </div>
            </div>

            {/* Budget Constraint */}
            <div className="space-y-2">
              <Label htmlFor="budget_constraint">Budget Constraint *</Label>
              <Input
                id="budget_constraint"
                placeholder="e.g., ₹500000, Limited budget, No constraint"
                {...register("budget_constraint")}
              />
              {errors.budget_constraint && (
                <p className="text-sm text-destructive">{errors.budget_constraint.message}</p>
              )}
            </div>

            {/* Specific Goals */}
            <div className="space-y-2">
              <Label htmlFor="specific_goals">Specific Goals (Optional)</Label>
              <Textarea
                id="specific_goals"
                rows={4}
                placeholder="e.g., Maximize yield, Organic farming, Water conservation..."
                {...register("specific_goals")}
              />
              {errors.specific_goals && (
                <p className="text-sm text-destructive">{errors.specific_goals.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Crop Plan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && <AICropPlannerResult result={result} />}
    </div>
  )
}

