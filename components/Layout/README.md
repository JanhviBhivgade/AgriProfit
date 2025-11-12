# Layout Components

This directory contains the main layout components for the Farm Expense Tracker application.

## Components

### AppLayout.jsx
The main layout wrapper component that combines the Sidebar and Header. This should wrap all page content.

**Usage:**
```jsx
import { AppLayout } from "@/components/Layout/AppLayout"

export default function Page() {
  return (
    <AppLayout user={user} farmName={farmName}>
      {/* Your page content */}
    </AppLayout>
  )
}
```

**Props:**
- `user` (object): User object with `id`, `email`, `full_name`
- `farmName` (string): Name of the farm

### Sidebar.jsx
Responsive sidebar navigation component with the following navigation items:
- Dashboard
- Expenses
- Yields
- Reports
- Settings

**Features:**
- Mobile-responsive with slide-in/out animation
- Active route highlighting
- Auto-closes on mobile when navigating

**Props:**
- `isOpen` (boolean): Controls sidebar visibility
- `onClose` (function): Callback to close the sidebar

### Header.jsx
Top header component with:
- Mobile menu button
- Farm name display
- Quick stats (total expenses, revenue, net profit)
- User menu

**Props:**
- `onMenuClick` (function): Toggle sidebar on mobile
- `user` (object): User object
- `farmName` (string): Farm name

### UserMenu.jsx
User profile dropdown menu with:
- User avatar with initials
- User name and email
- Farm name
- Settings link
- Sign out button

**Props:**
- `user` (object): User object
- `farmName` (string): Farm name

## Responsive Design

The layout is fully responsive:
- **Mobile (< 1024px)**: Sidebar is hidden by default, accessible via hamburger menu
- **Desktop (≥ 1024px)**: Sidebar is always visible, fixed on the left

## Integration with Supabase

To integrate with actual user data:

1. Replace mock user data in pages with Supabase auth:
```jsx
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

const supabase = createClient()
const [user, setUser] = useState(null)

useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    setUser(user)
  })
}, [])
```

2. Fetch farm name from profiles table:
```jsx
const { data: profile } = await supabase
  .from('profiles')
  .select('farm_name')
  .eq('id', user.id)
  .single()
```

3. Update Header stats with real data from the database.

## Styling

All components use Tailwind CSS and follow the shadcn/ui design system. The layout uses:
- CSS variables for theming (light/dark mode support)
- Responsive breakpoints (sm, md, lg)
- Smooth transitions and animations

