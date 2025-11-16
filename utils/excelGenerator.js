import * as XLSX from "xlsx"
import { format } from "date-fns"

/**
 * Generate Excel report with multiple sheets
 * @param {Object} options - Report generation options
 * @param {Object} options.summary - Financial summary data
 * @param {Array} options.expenses - Expense data
 * @param {Array} options.yields - Yield data
 * @param {Object} options.filters - Applied filters
 * @param {string} options.farmName - Farm name
 * @param {string} options.reportType - Type of report
 */
export function generateExcelReport({
  summary,
  expenses = [],
  yields = [],
  filters = {},
  farmName = "Farm",
  reportType = "Financial Summary",
}) {
  const workbook = XLSX.utils.book_new()

  // Summary Sheet
  if (summary) {
    const summaryData = [
      ["Farm Financial Report"],
      [farmName],
      [`Report Type: ${reportType}`],
      [],
      ["Financial Summary"],
      ["Total Expenses", summary.totalExpenses],
      ["Total Revenue", summary.totalRevenue],
      ["Net Profit", summary.netProfit],
      ["Profit Margin (%)", summary.profitMargin],
      [],
      ["Report Generated", format(new Date(), "MMMM dd, yyyy 'at' hh:mm a")],
    ]

    if (filters.startDate || filters.endDate) {
      summaryData.splice(4, 0, [
        "Period",
        `${filters.startDate ? format(new Date(filters.startDate), "MMM dd, yyyy") : "Start"} - ${
          filters.endDate ? format(new Date(filters.endDate), "MMM dd, yyyy") : "End"
        }`,
      ])
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    
    // Set column widths
    summarySheet["!cols"] = [{ wch: 25 }, { wch: 20 }]
    
    // Style header row
    if (!summarySheet["!merges"]) summarySheet["!merges"] = []
    summarySheet["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } })
    summarySheet["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 1 } })
    summarySheet["!merges"].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 1 } })

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")
  }

  // Expenses Sheet
  if (expenses.length > 0) {
    const expenseData = expenses.map((exp) => ({
      Date: format(new Date(exp.date), "yyyy-MM-dd"),
      Category: (exp.category || "").charAt(0).toUpperCase() + (exp.category || "").slice(1),
      Crop: exp.crops?.name || "N/A",
      Description: exp.description || "",
      Amount: parseFloat(exp.amount || 0),
      Quantity: exp.quantity ? parseFloat(exp.quantity) : null,
      Unit: exp.unit || null,
    }))

    const expenseSheet = XLSX.utils.json_to_sheet(expenseData)
    
    // Add total row
    const totalRow = expenseData.length + 2
    expenseSheet[`A${totalRow}`] = { t: "s", v: "TOTAL" }
    expenseSheet[`E${totalRow}`] = {
      t: "n",
      v: expenseData.reduce((sum, exp) => sum + exp.Amount, 0),
    }

    // Set column widths
    expenseSheet["!cols"] = [
      { wch: 12 }, // Date
      { wch: 15 }, // Category
      { wch: 20 }, // Crop
      { wch: 30 }, // Description
      { wch: 12 }, // Amount
      { wch: 10 }, // Quantity
      { wch: 8 },  // Unit
    ]

    XLSX.utils.book_append_sheet(workbook, expenseSheet, "Expenses")
  }

  // Yields Sheet
  if (yields.length > 0) {
    const yieldData = yields.map((y) => ({
      "Harvest Date": format(new Date(y.harvest_date), "yyyy-MM-dd"),
      Crop: y.crops?.name || "Unknown",
      Quantity: parseFloat(y.quantity || 0),
      Unit: y.unit || "",
      "Sale Price": parseFloat(y.sale_price || 0),
      "Total Revenue": parseFloat(y.total_revenue || 0),
    }))

    const yieldSheet = XLSX.utils.json_to_sheet(yieldData)
    
    // Add total row
    const totalRow = yieldData.length + 2
    yieldSheet[`A${totalRow}`] = { t: "s", v: "TOTAL" }
    yieldSheet[`F${totalRow}`] = {
      t: "n",
      v: yieldData.reduce((sum, y) => sum + y["Total Revenue"], 0),
    }

    // Set column widths
    yieldSheet["!cols"] = [
      { wch: 12 }, // Harvest Date
      { wch: 20 }, // Crop
      { wch: 12 }, // Quantity
      { wch: 8 },  // Unit
      { wch: 12 }, // Sale Price
      { wch: 15 }, // Total Revenue
    ]

    XLSX.utils.book_append_sheet(workbook, yieldSheet, "Yields")
  }

  // Expense by Category Sheet
  if (expenses.length > 0) {
    const categoryTotals = {}
    expenses.forEach((exp) => {
      const cat = exp.category || "other"
      categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount || 0)
    })

    const categoryData = Object.entries(categoryTotals)
      .map(([category, total]) => ({
        Category: category.charAt(0).toUpperCase() + category.slice(1),
        "Total Amount": total,
        "Percentage": ((total / expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)) * 100).toFixed(2) + "%",
      }))
      .sort((a, b) => b["Total Amount"] - a["Total Amount"])

    const categorySheet = XLSX.utils.json_to_sheet(categoryData)
    
    // Set column widths
    categorySheet["!cols"] = [
      { wch: 20 }, // Category
      { wch: 15 }, // Total Amount
      { wch: 12 }, // Percentage
    ]

    XLSX.utils.book_append_sheet(workbook, categorySheet, "Expenses by Category")
  }

  // Crop Performance Sheet
  if (expenses.length > 0 && yields.length > 0) {
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
          cropData[y.crop_id] = { name: y.crops?.name || "Unknown", expenses: 0, revenue: 0 }
        }
        cropData[y.crop_id].revenue += parseFloat(y.total_revenue || 0)
      }
    })

    const performanceData = Object.values(cropData)
      .map((crop) => {
        const profit = crop.revenue - crop.expenses
        const margin = crop.revenue > 0 ? (profit / crop.revenue) * 100 : 0
        return {
          Crop: crop.name,
          Expenses: crop.expenses,
          Revenue: crop.revenue,
          Profit: profit,
          "Profit Margin (%)": margin.toFixed(2),
        }
      })
      .sort((a, b) => b.Profit - a.Profit)

    const performanceSheet = XLSX.utils.json_to_sheet(performanceData)
    
    // Set column widths
    performanceSheet["!cols"] = [
      { wch: 20 }, // Crop
      { wch: 15 }, // Expenses
      { wch: 15 }, // Revenue
      { wch: 15 }, // Profit
      { wch: 18 }, // Profit Margin
    ]

    XLSX.utils.book_append_sheet(workbook, performanceSheet, "Crop Performance")
  }

  // Generate filename and save
  const filename = `Farm_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`
  XLSX.writeFile(workbook, filename)
}

/**
 * Export current view data to Excel
 */
export function exportToExcel(data, sheetName = "Data", filename = "export.xlsx") {
  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName)
  XLSX.writeFile(workbook, filename)
}

