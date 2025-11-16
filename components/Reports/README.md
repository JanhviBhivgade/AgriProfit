# Report Generation Components

This directory contains components for generating and exporting farm financial reports.

## Components

### ReportGenerator.jsx

A comprehensive form component for generating custom reports.

**Features:**
- Report type selection (Financial Summary, Expense Breakdown, Crop Performance)
- Date range filtering (optional)
- Crop selection (optional - can select specific crops or all)
- Real-time preview of report data
- Generate PDF or Excel reports
- Professional formatting suitable for sharing with banks

**Report Types:**
1. **Financial Summary**: Complete financial overview with expenses, revenue, profit, and margins
2. **Expense Breakdown**: Detailed expense analysis by category
3. **Crop Performance**: Crop-by-crop profitability analysis

**Usage:**
```jsx
<ReportGenerator farmName="Green Valley Farm" />
```

### ExportButtons.jsx

Quick export buttons for current view data.

**Features:**
- Export current data to PDF (requires element ID for chart/table capture)
- Export current data to Excel
- Handles different data types (expenses, yields, etc.)
- Automatic filename generation

**Usage:**
```jsx
<ExportButtons
  data={expenses}
  dataType="expenses"
  elementId="expense-table" // Optional, for PDF export
  filename="my-report.pdf" // Optional
/>
```

## Utilities

### pdfGenerator.js

Functions for generating PDF reports using jsPDF and html2canvas.

**Functions:**
- `generatePDFReport(options)`: Generate comprehensive PDF report with:
  - Header with farm name and report type
  - Financial summary
  - Expense breakdown by category
  - Detailed expense table
  - Yield details
  - Crop performance analysis
  - Professional formatting
  - Page numbers

- `generatePDFFromElement(element, filename)`: Generate PDF from HTML element (for charts/tables)

### excelGenerator.js

Functions for exporting data to Excel using SheetJS (xlsx).

**Functions:**
- `generateExcelReport(options)`: Generate comprehensive Excel workbook with multiple sheets:
  - Summary sheet
  - Expenses sheet
  - Yields sheet
  - Expenses by Category sheet
  - Crop Performance sheet

- `exportToExcel(data, sheetName, filename)`: Quick export of data array to Excel

## Report Features

### PDF Reports
- Professional formatting
- Multi-page support
- Automatic page breaks
- Page numbers
- Suitable for bank submissions
- Includes all financial data
- Charts can be included via element capture

### Excel Reports
- Multiple sheets for different data views
- Formatted columns
- Total rows
- Easy to analyze and manipulate
- Compatible with all spreadsheet software

## Data Filtering

Reports support:
- **Date Range**: Filter by start and end date
- **Crop Selection**: Include specific crops or all crops
- **Report Type**: Different report formats for different needs

## Integration

The report generator:
- Uses `useExpenses()` and `useYields()` hooks
- Automatically fetches filtered data
- Calculates summary metrics
- Generates reports with current data

## File Naming

Generated files use the format:
- PDF: `Farm_Report_YYYY-MM-DD.pdf`
- Excel: `Farm_Report_YYYY-MM-DD.xlsx`

Custom filenames can be provided for quick exports.

## Browser Compatibility

- PDF generation works in all modern browsers
- Excel export works in all browsers
- Requires jsPDF, html2canvas, and xlsx libraries (already installed)

