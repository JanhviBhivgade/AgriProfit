# Crop Management Components

This directory contains components for managing crop inventory.

## Components

### CropForm.jsx

A form component for adding and editing crops.

**Features:**
- Form validation using react-hook-form and Zod
- Required field: Name (max 100 characters)
- Optional field: Description
- Edit mode support
- Loading states

**Props:**
- `crop` (object, optional): Existing crop data for editing
- `onSubmit` (function): Callback when form is submitted
- `onCancel` (function, optional): Callback when form is cancelled

**Usage:**
```jsx
<CropForm
  crop={crop} // Optional, for editing
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

### CropList.jsx

A complete crop management interface with table and CRUD operations.

**Features:**
- Display crops in a sortable table
- Shows crop name, description, and creation date
- Create, edit, and delete crops
- Responsive design
- Loading and error states
- Empty state with call-to-action

**Usage:**
```jsx
<CropList />
```

## Form Fields

### Required Fields
- **Name**: Text input (1-100 characters)

### Optional Fields
- **Description**: Textarea for additional details

## Validation

The form uses Zod schema validation:
- Name is required (min 1 character, max 100 characters)
- Description is optional

## Integration

The components use the `useCrops` hook which:
- Fetches crops from Supabase
- Handles authentication
- Manages loading and error states
- Provides CRUD operations
- Automatically sorts crops alphabetically by name

## API Routes

The crop management uses client-side Supabase calls directly. The API routes in `app/api/crops/route.js` are available for server-side operations if needed.

## Database

Crops are stored in the `crops` table with:
- `id` (UUID, primary key)
- `user_id` (references profiles)
- `name` (text, required)
- `description` (text, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Notes

- Crops are automatically sorted alphabetically by name
- Deleting a crop does not delete associated expenses or yields, but they will no longer be linked to the crop
- All operations are user-scoped (users can only manage their own crops)

## Styling

All components use:
- shadcn/ui components for consistent styling
- Tailwind CSS for layout and responsive design
- Lucide React icons

