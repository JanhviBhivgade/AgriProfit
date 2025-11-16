# Expense Management Components

This directory contains components for managing farm input expenses.

## Components

### ExpenseForm.jsx

A comprehensive form component for adding and editing expenses.

**Features:**
- Form validation using react-hook-form and Zod
- All required fields: category, description, amount, date
- Optional fields: crop, quantity, unit
- Date picker with calendar component
- Dropdown for selecting user's crops
- Loading states and error handling

**Props:**
- `expense` (object, optional): Existing expense data for editing
- `onSubmit` (function): Callback when form is submitted
- `onCancel` (function, optional): Callback when form is cancelled

**Usage:**
```jsx
<ExpenseForm
  expense={expense} // Optional, for editing
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

### ExpenseList.jsx

A complete expense management interface with table, filters, and CRUD operations.

**Features:**
- Display expenses in a sortable table
- Filter by category and date range
- Total expenses summary card
- Create, edit, and delete expenses
- Responsive design
- Loading and error states

**Usage:**
```jsx
<ExpenseList />
```

## Form Fields

### Required Fields
- **Category**: Dropdown with options (seeds, fertilizers, pesticides, fuel, labor, equipment, water, other)
- **Description**: Text input
- **Amount**: Number input (decimal)
- **Date**: Date picker

### Optional Fields
- **Crop**: Dropdown populated from user's crops
- **Quantity**: Number input (decimal)
- **Unit**: Text input (e.g., "kg", "L", "bags")

## Validation

The form uses Zod schema validation:
- Category must be one of the predefined values
- Description is required (min 1 character)
- Amount must be a positive number
- Date is required

## Integration

The components use the `useExpenses` hook which:
- Fetches expenses from Supabase
- Handles authentication
- Manages loading and error states
- Provides CRUD operations

## API Routes

The expense management uses client-side Supabase calls directly. The API routes in `app/api/expenses/route.js` are available for server-side operations if needed.

## Styling

All components use:
- shadcn/ui components for consistent styling
- Tailwind CSS for layout and responsive design
- Lucide React icons

