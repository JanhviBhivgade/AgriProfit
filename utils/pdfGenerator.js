import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { format } from "date-fns"
import { formatCurrency, formatNumberIN } from "@/lib/utils"

/**
 * Generate a comprehensive PDF report
 * @param {Object} options - Report generation options
 * @param {Object} options.summary - Financial summary data
 * @param {Array} options.expenses - Expense data
 * @param {Array} options.yields - Yield data
 * @param {Object} options.filters - Applied filters
 * @param {string} options.farmName - Farm name
 * @param {string} options.reportType - Type of report
 */
export async function generatePDFReport({
  summary,
  expenses = [],
  yields = [],
  filters = {},
  farmName = "Farm",
  reportType = "Financial Summary",
}) {
  const doc = new jsPDF("p", "mm", "a4")
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let yPosition = margin

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredHeight) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Helper function to add text with word wrap
  const addText = (text, x, y, maxWidth, fontSize = 10, align = "left") => {
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, x, y, { align })
    return lines.length * (fontSize * 0.4) // Approximate line height
  }

  // Header
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("Farm Financial Report", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 8

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(farmName, pageWidth / 2, yPosition, { align: "center" })
  yPosition += 6

  doc.setFontSize(10)
  doc.text(`Report Type: ${reportType}`, pageWidth / 2, yPosition, { align: "center" })
  yPosition += 5

  // Date range
  if (filters.startDate || filters.endDate) {
    const dateRange = `Period: ${
      filters.startDate ? format(new Date(filters.startDate), "MMM dd, yyyy") : "Start"
    } - ${
      filters.endDate ? format(new Date(filters.endDate), "MMM dd, yyyy") : "End"
    }`
    doc.text(dateRange, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 5
  }

  doc.text(
    `Generated: ${format(new Date(), "MMMM dd, yyyy 'at' hh:mm a")}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  )
  yPosition += 10

  // Summary Section
  if (summary) {
    checkPageBreak(30)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Financial Summary", margin, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const summaryData = [
      ["Total Expenses", `Rs ${formatNumberIN(summary.totalExpenses)}`],
      ["Total Revenue", `Rs ${formatNumberIN(summary.totalRevenue)}`],
      ["Net Profit", `Rs ${formatNumberIN(summary.netProfit)}`],
      ["Profit Margin", `${summary.profitMargin.toFixed(2)}%`],
    ]

    summaryData.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold")
      doc.text(label + ":", margin, yPosition)
      doc.setFont("helvetica", "normal")
      doc.text(value, pageWidth - margin - 50, yPosition, { align: "right" })
      yPosition += 6
    })
    yPosition += 5
  }

  // Expense Breakdown
  if (expenses.length > 0) {
    checkPageBreak(40)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Expense Breakdown", margin, yPosition)
    yPosition += 8

    // Expense by category
    const categoryTotals = {}
    expenses.forEach((exp) => {
      const cat = exp.category || "other"
      categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount || 0)
    })

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, total]) => {
        checkPageBreak(6)
        const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1)
        doc.setFont("helvetica", "bold")
        doc.text(categoryLabel + ":", margin, yPosition)
        doc.setFont("helvetica", "normal")
        doc.text(`Rs ${formatNumberIN(total)}`, pageWidth - margin - 50, yPosition, {
          align: "right",
        })
        yPosition += 6
      })
    yPosition += 5
  }

  // Expense Details Table
  if (expenses.length > 0 && reportType !== "Crop Performance") {
    checkPageBreak(30)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Expense Details", margin, yPosition)
    yPosition += 8

    // Table header
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    const tableHeaders = ["Date", "Category", "Description", "Amount"]
    const colWidths = [30, 35, 80, 30]
    let xPos = margin

    tableHeaders.forEach((header, index) => {
      doc.text(header, xPos, yPosition)
      xPos += colWidths[index]
    })
    yPosition += 6

    // Table rows
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    expenses.slice(0, 20).forEach((expense) => {
      // Limit to 20 rows to avoid page overflow
      checkPageBreak(6)
      xPos = margin
      const rowData = [
        format(new Date(expense.date), "MM/dd/yy"),
        (expense.category || "").charAt(0).toUpperCase() +
          (expense.category || "").slice(1),
        (expense.description || "").substring(0, 40),
        `Rs ${formatNumberIN(parseFloat(expense.amount || 0))}`,
      ]

      rowData.forEach((data, index) => {
        doc.text(data, xPos, yPosition)
        xPos += colWidths[index]
      })
      yPosition += 6
    })

    if (expenses.length > 20) {
      yPosition += 3
      doc.setFontSize(8)
      doc.setFont("helvetica", "italic")
      doc.text(
        `... and ${expenses.length - 20} more expenses`,
        margin,
        yPosition
      )
      yPosition += 5
    }
    yPosition += 5
  }

  // Yield Details
  if (yields.length > 0) {
    checkPageBreak(30)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Yield Details", margin, yPosition)
    yPosition += 8

    // Table header
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    const tableHeaders = ["Date", "Crop", "Quantity", "Revenue"]
    const colWidths = [30, 50, 50, 50]
    let xPos = margin

    tableHeaders.forEach((header, index) => {
      doc.text(header, xPos, yPosition)
      xPos += colWidths[index]
    })
    yPosition += 6

    // Table rows
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    yields.slice(0, 20).forEach((yieldRecord) => {
      checkPageBreak(6)
      xPos = margin
      const rowData = [
        format(new Date(yieldRecord.harvest_date), "MM/dd/yy"),
        yieldRecord.crops?.name || "Unknown",
        `${parseFloat(yieldRecord.quantity || 0).toFixed(2)} ${yieldRecord.unit || ""}`,
        `Rs ${formatNumberIN(parseFloat(yieldRecord.total_revenue || 0))}`,
      ]

      rowData.forEach((data, index) => {
        doc.text(data, xPos, yPosition)
        xPos += colWidths[index]
      })
      yPosition += 6
    })

    if (yields.length > 20) {
      yPosition += 3
      doc.setFontSize(8)
      doc.setFont("helvetica", "italic")
      doc.text(`... and ${yields.length - 20} more yields`, margin, yPosition)
      yPosition += 5
    }
    yPosition += 5
  }

  // Crop Performance (if applicable)
  if (reportType === "Crop Performance" && expenses.length > 0 && yields.length > 0) {
    checkPageBreak(40)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Crop Performance Analysis", margin, yPosition)
    yPosition += 8

    // Calculate crop profitability
    const cropData = {}
    expenses.forEach((exp) => {
      if (exp.crop_id) {
        const cropName = exp.crops?.name || "Unknown"
        if (!cropData[exp.crop_id]) {
          cropData[exp.crop_id] = { name: cropName, expenses: 0, revenue: 0 }
        }
        cropData[exp.crop_id].expenses += parseFloat(exp.amount || 0)
      }
    })

    yields.forEach((y) => {
      if (y.crop_id) {
        if (!cropData[y.crop_id]) {
          cropData[y.crop_id] = {
            name: y.crops?.name || "Unknown",
            expenses: 0,
            revenue: 0,
          }
        }
        cropData[y.crop_id].revenue += parseFloat(y.total_revenue || 0)
      }
    })

    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    const perfHeaders = ["Crop", "Expenses", "Revenue", "Profit"]
    const perfColWidths = [60, 40, 40, 40]
    xPos = margin

    perfHeaders.forEach((header, index) => {
      doc.text(header, xPos, yPosition)
      xPos += perfColWidths[index]
    })
    yPosition += 6

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    Object.values(cropData)
      .sort((a, b) => b.revenue - b.expenses - (a.revenue - a.expenses))
      .forEach((crop) => {
        checkPageBreak(6)
        const profit = crop.revenue - crop.expenses
        xPos = margin
        const rowData = [
          crop.name,
          `Rs ${formatNumberIN(crop.expenses)}`,
          `Rs ${formatNumberIN(crop.revenue)}`,
          `Rs ${formatNumberIN(profit)}`,
        ]

        rowData.forEach((data, index) => {
          doc.text(data, xPos, yPosition)
          xPos += perfColWidths[index]
        })
        yPosition += 6
      })
  }

  // Footer
  const totalPages = doc.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    )
  }

  // Generate filename
  const filename = `Farm_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`
  doc.save(filename)
}

/**
 * Generate PDF from HTML element (for charts)
 */
export async function generatePDFFromElement(element, filename = "report.pdf") {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(filename)
  } catch (error) {
    console.error("Error generating PDF from element:", error)
    throw error
  }
}

