"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, FileText, FileSpreadsheet } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useExpenses } from "@/hooks/useExpenses"
import { useYields } from "@/hooks/useYields"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, formatCurrency } from "@/lib/utils"
import { generatePDFReport } from "@/utils/pdfGenerator"
import { generateExcelReport } from "@/utils/excelGenerator"

const reportSchema = z.object({
  reportType: z.enum(["Financial Summary", "Expense Breakdown", "Crop Performance"], {
    required_error: "Please select a report type",
  }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  cropIds: z.array(z.string()).optional(),
})

const reportTypes = [
  { value: "Financial Summary", label: "Financial Summary" },
  { value: "Expense Breakdown", label: "Expense Breakdown" },
  { value: "Crop Performance", label: "Crop Performance" },
]

export function ReportGenerator({ farmName = "Farm" }) {
  const [crops, setCrops] = useState([])
  const [loadingCrops, setLoadingCrops] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedCrops, setSelectedCrops] = useState([])

  const { expenses, fetchExpenses, totalExpenses } = useExpenses()
  const { yields, fetchYields, totalRevenue } = useYields()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: "Financial Summary",
      startDate: undefined,
      endDate: undefined,
    },
  })

  const selectedStartDate = watch("startDate")
  const selectedEndDate = watch("endDate")
  const selectedReportType = watch("reportType")

  // Fetch crops
  useEffect(() => {
    async function fetchCrops() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from("crops")
          .select("id, name")
          .eq("user_id", user.id)
          .order("name")

        if (error) throw error
        setCrops(data || [])
      } catch (error) {
        console.error("Error fetching crops:", error)
      } finally {
        setLoadingCrops(false)
      }
    }

    fetchCrops()
  }, [])

  // Fetch data based on filters
  useEffect(() => {
    const filters = {
      startDate: selectedStartDate ? format(selectedStartDate, "yyyy-MM-dd") : undefined,
      endDate: selectedEndDate ? format(selectedEndDate, "yyyy-MM-dd") : undefined,
      cropId: selectedCrops.length === 1 ? selectedCrops[0] : undefined,
    }
    fetchExpenses(filters)
    fetchYields(filters)
  }, [selectedStartDate, selectedEndDate, selectedCrops, fetchExpenses, fetchYields])

  const handleGeneratePDF = async () => {
    setGenerating(true)
    try {
      // Filter data based on selected crops
      let filteredExpenses = expenses
      let filteredYields = yields

      if (selectedCrops.length > 0) {
        filteredExpenses = expenses.filter(
          (exp) => !exp.crop_id || selectedCrops.includes(exp.crop_id)
        )
        filteredYields = yields.filter((y) => selectedCrops.includes(y.crop_id))
      }

      // Calculate summary
      const totalExp = filteredExpenses.reduce(
        (sum, exp) => sum + parseFloat(exp.amount || 0),
        0
      )
      const totalRev = filteredYields.reduce(
        (sum, y) => sum + parseFloat(y.total_revenue || 0),
        0
      )
      const netProfit = totalRev - totalExp
      const profitMargin = totalRev > 0 ? (netProfit / totalRev) * 100 : 0

      await generatePDFReport({
        summary: {
          totalExpenses: totalExp,
          totalRevenue: totalRev,
          netProfit,
          profitMargin,
        },
        expenses: filteredExpenses,
        yields: filteredYields,
        filters: {
          startDate: selectedStartDate ? format(selectedStartDate, "yyyy-MM-dd") : undefined,
          endDate: selectedEndDate ? format(selectedEndDate, "yyyy-MM-dd") : undefined,
        },
        farmName,
        reportType: selectedReportType,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF report. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateExcel = async () => {
    setGenerating(true)
    try {
      // Filter data based on selected crops
      let filteredExpenses = expenses
      let filteredYields = yields

      if (selectedCrops.length > 0) {
        filteredExpenses = expenses.filter(
          (exp) => !exp.crop_id || selectedCrops.includes(exp.crop_id)
        )
        filteredYields = yields.filter((y) => selectedCrops.includes(y.crop_id))
      }

      // Calculate summary
      const totalExp = filteredExpenses.reduce(
        (sum, exp) => sum + parseFloat(exp.amount || 0),
        0
      )
      const totalRev = filteredYields.reduce(
        (sum, y) => sum + parseFloat(y.total_revenue || 0),
        0
      )
      const netProfit = totalRev - totalExp
      const profitMargin = totalRev > 0 ? (netProfit / totalRev) * 100 : 0

      generateExcelReport({
        summary: {
          totalExpenses: totalExp,
          totalRevenue: totalRev,
          netProfit,
          profitMargin,
        },
        expenses: filteredExpenses,
        yields: filteredYields,
        filters: {
          startDate: selectedStartDate ? format(selectedStartDate, "yyyy-MM-dd") : undefined,
          endDate: selectedEndDate ? format(selectedEndDate, "yyyy-MM-dd") : undefined,
        },
        farmName,
        reportType: selectedReportType,
      })
    } catch (error) {
      console.error("Error generating Excel:", error)
      alert("Error generating Excel report. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const toggleCropSelection = (cropId) => {
    setSelectedCrops((prev) =>
      prev.includes(cropId)
        ? prev.filter((id) => id !== cropId)
        : [...prev, cropId]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Report</CardTitle>
        <CardDescription>
          Create professional reports for your farm operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Report Type */}
          <div className="space-y-2">
            <Label>Report Type *</Label>
            <Select
              value={selectedReportType}
              onValueChange={(value) => setValue("reportType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reportType && (
              <p className="text-sm text-destructive">{errors.reportType.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedStartDate ? (
                      format(selectedStartDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedStartDate}
                    onSelect={(date) => setValue("startDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedEndDate ? (
                      format(selectedEndDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedEndDate}
                    onSelect={(date) => setValue("endDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Crop Selection */}
          {!loadingCrops && crops.length > 0 && (
            <div className="space-y-2">
              <Label>Crops (Optional - Leave empty for all crops)</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {crops.map((crop) => (
                  <label
                    key={crop.id}
                    className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-accent rounded px-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCrops.includes(crop.id)}
                      onChange={() => toggleCropSelection(crop.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{crop.name}</span>
                  </label>
                ))}
              </div>
              {selectedCrops.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedCrops.length} crop{selectedCrops.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          )}

          {/* Summary Preview */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Report Preview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Expenses:</span>{" "}
                <span className="font-medium">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Revenue:</span>{" "}
                <span className="font-medium">
                  {formatCurrency(totalRevenue)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Records:</span>{" "}
                <span className="font-medium">
                  {expenses.length} expenses, {yields.length} yields
                </span>
              </div>
            </div>
          </div>

          {/* Generate Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleGeneratePDF}
              disabled={generating}
              className="flex-1"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate PDF
                </>
              )}
            </Button>
            <Button
              onClick={handleGenerateExcel}
              disabled={generating}
              variant="outline"
              className="flex-1"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Generate Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

