# Dashboard Components

This directory contains all dashboard visualization and calculation components.

## Components

### ProfitCalculator.jsx

Calculates and displays key financial metrics:
- **Total Expenses**: Sum of all expenses
- **Total Revenue**: Sum of all yields revenue
- **Net Profit**: Revenue - Expenses
- **Profit Margin**: (Net Profit / Revenue) × 100
- **Per-Crop Profitability**: Breakdown showing expenses, revenue, profit, and margin for each crop

**Features:**
- Real-time calculations using useExpenses and useYields hooks
- Color-coded indicators (green for profit, red for loss)
- Sorted by profitability (most profitable first)

### ExpenseChart.jsx

Line chart showing expenses over time.

**Features:**
- Date range filtering (start and end date)
- Responsive design using Recharts
- Interactive tooltips
- Reset button to clear filters
- Defaults to last 30 days

**Usage:**
```jsx
<ExpenseChart />
```

### ExpenseByCategoryChart.jsx

Pie chart showing expense breakdown by category.

**Features:**
- Visual pie chart with color-coded categories
- Percentage labels on chart
- Summary table with detailed breakdown
- Responsive design
- 8 predefined colors for categories

**Categories:**
- Seeds
- Fertilizers
- Pesticides
- Fuel
- Labor
- Equipment
- Water
- Other

### CropComparison.jsx

Bar chart comparing expenses vs revenue by crop.

**Features:**
- Side-by-side comparison of expenses, revenue, and profit
- Most profitable crop highlight card
- Least profitable crop highlight card
- Responsive bar chart
- Sorted by profitability

**Data Shown:**
- Expenses per crop
- Revenue per crop
- Profit per crop (calculated)

### RecentActivity.jsx

Displays recent expenses and yields in table format.

**Features:**
- Shows latest 5 expenses
- Shows latest 5 yields
- Side-by-side layout
- Loading states
- Empty states

## Dashboard Layout

The main dashboard (`app/page.js`) is organized as:

1. **Welcome Section**: Title and description
2. **Profit Calculator**: Key metrics and per-crop profitability
3. **Charts Section**: Expense chart and category breakdown (side by side)
4. **Crop Comparison**: Bar chart with most/least profitable highlights
5. **Recent Activity**: Recent expenses and yields tables

## Dependencies

All components use:
- **Recharts**: For all chart visualizations
- **date-fns**: For date formatting and manipulation
- **useExpenses hook**: For expense data
- **useYields hook**: For yield data
- **shadcn/ui components**: For consistent UI

## Responsive Design

All charts are responsive and adapt to:
- Mobile: Single column layout
- Tablet: 2-column layout for charts
- Desktop: Full layout with all components visible

## Data Flow

1. Components fetch data using `useExpenses()` and `useYields()` hooks
2. Data is processed and transformed for visualization
3. Charts render using Recharts with responsive containers
4. Calculations are done in real-time using useMemo for performance

## Styling

- Charts use theme colors from CSS variables
- Consistent card styling with shadcn/ui
- Color-coded indicators (green for profit, red for loss)
- Responsive breakpoints: sm, md, lg

