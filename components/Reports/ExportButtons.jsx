"use client"

import { useState } from "react"
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generatePDFFromElement } from "@/utils/pdfGenerator"
import { exportToExcel } from "@/utils/excelGenerator"
import { format } from "date-fns"

/**
 * Export buttons for quick export of current view
 */
export function ExportButtons({
  data = [],
  dataType = "data",
  elementId = null,
  filename = null,
}) {
  const [exporting, setExporting] = useState(false)

  const handleExportPDF = async () => {
    if (!elementId) {
      alert("Element ID is required for PDF export")
      return
    }

    setExporting(true)
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        alert("Element not found for PDF export")
        return
      }

      const defaultFilename = filename || `${dataType}_${format(new Date(), "yyyy-MM-dd")}.pdf`
      await generatePDFFromElement(element, defaultFilename)
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      alert("Error exporting to PDF. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  const handleExportExcel = () => {
    if (!data || data.length === 0) {
      alert("No data to export")
      return
    }

    setExporting(true)
    try {
      // Transform data for Excel export
      const excelData = data.map((item) => {
        // Handle different data types
        if (dataType === "expenses") {
          return {
            Date: format(new Date(item.date), "yyyy-MM-dd"),
            Category: (item.category || "").charAt(0).toUpperCase() + (item.category || "").slice(1),
            Crop: item.crops?.name || "N/A",
            Description: item.description || "",
            Amount: parseFloat(item.amount || 0),
            Quantity: item.quantity ? parseFloat(item.quantity) : null,
            Unit: item.unit || null,
          }
        } else if (dataType === "yields") {
          return {
            "Harvest Date": format(new Date(item.harvest_date), "yyyy-MM-dd"),
            Crop: item.crops?.name || "Unknown",
            Quantity: parseFloat(item.quantity || 0),
            Unit: item.unit || "",
            "Sale Price": parseFloat(item.sale_price || 0),
            "Total Revenue": parseFloat(item.total_revenue || 0),
          }
        }
        return item
      })

      const defaultFilename = filename || `${dataType}_${format(new Date(), "yyyy-MM-dd")}.xlsx`
      exportToExcel(excelData, dataType, defaultFilename)
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      alert("Error exporting to Excel. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      {elementId && (
        <Button
          onClick={handleExportPDF}
          disabled={exporting}
          variant="outline"
          size="sm"
        >
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </>
          )}
        </Button>
      )}
      <Button
        onClick={handleExportExcel}
        disabled={exporting || !data || data.length === 0}
        variant="outline"
        size="sm"
      >
        {exporting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </>
        )}
      </Button>
    </div>
  )
}

