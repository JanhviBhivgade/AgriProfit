# Yield Management Components

This directory contains components for managing crop yields and harvest records.

## Components

### YieldForm.jsx

A comprehensive form component for adding and editing yield records.

**Features:**
- Form validation using react-hook-form and Zod
- All required fields: crop, quantity, unit, sale price, harvest date
- Real-time total revenue calculation (quantity × sale price)
- Date picker with calendar component
- Dropdown for selecting user's crops
- Loading states and error handling
- Revenue preview card

**Props:**
- `yield` (object, optional): Existing yield data for editing
- `onSubmit` (function): Callback when form is submitted
- `onCancel` (function, optional): Callback when form is cancelled

**Usage:**
```jsx
<YieldForm
  yield={yieldData} // Optional, for editing
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

### YieldList.jsx

A complete yield management interface with table, filters, and CRUD operations.

**Features:**
- Display yields in a sortable table
- Filter by crop and date range
- Summary cards showing:
  - Total Revenue
  - Total Quantity
  - Number of records
- Create, edit, and delete yield records
- Responsive design
- Loading and error states

**Usage:**
```jsx
<YieldList />
```

## Form Fields

### Required Fields
- **Crop**: Dropdown populated from user's crops
- **Quantity**: Number input (decimal)
- **Unit**: Text input (e.g., "kg", "tons", "bags")
- **Sale Price per Unit**: Number input (decimal)
- **Harvest Date**: Date picker

### Auto-Calculated
- **Total Revenue**: Automatically calculated as `quantity × sale_price` (stored in database)

## Validation

The form uses Zod schema validation:
- Crop must be selected
- Quantity must be a positive number
- Unit is required
- Sale price must be a non-negative number
- Harvest date is required

## Integration

The components use the `useYields` hook which:
- Fetches yields from Supabase
- Handles authentication
- Manages loading and error states
- Provides CRUD operations
- Calculates totals (revenue and quantity)

## API Routes

The yield management uses client-side Supabase calls directly. The API routes in `app/api/yields/route.js` are available for server-side operations if needed.

## Database

The `yields` table has a computed column `total_revenue` that automatically calculates `quantity × sale_price`. This ensures data consistency and eliminates the need for manual calculations.

## Styling

All components use:
- shadcn/ui components for consistent styling
- Tailwind CSS for layout and responsive design
- Lucide React icons

