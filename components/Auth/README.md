# Authentication Components

This directory contains authentication-related components for the Farm Expense Tracker.

## Components

### AuthGuard.jsx

A higher-order component that protects routes by checking authentication status.

**Features:**
- Redirects to login if user is not authenticated
- Shows loading state while checking authentication
- Wraps protected pages/components

**Usage:**
```jsx
<AuthGuard>
  <YourProtectedComponent />
</AuthGuard>
```

## Hooks

### useAuth.js

Custom hook for managing authentication state and operations.

**Features:**
- User authentication state
- Profile management
- Sign up, sign in, sign out functions
- Profile updates
- Automatic session management

**Returns:**
- `user`: Current authenticated user object
- `profile`: User profile from profiles table
- `loading`: Loading state
- `error`: Error message
- `isAuthenticated`: Boolean indicating if user is authenticated
- `signUp(email, password, fullName, farmName)`: Sign up function
- `signIn(email, password)`: Sign in function
- `signOut()`: Sign out function
- `updateProfile(updates)`: Update user profile

**Usage:**
```jsx
const { user, profile, isAuthenticated, signIn, signOut } = useAuth()
```

## Pages

### Login Page (`app/auth/login/page.js`)

Login form with email and password authentication.

**Features:**
- Email/password form
- Form validation with Zod
- Error handling
- Redirect to dashboard on success
- Link to signup page

### Signup Page (`app/auth/signup/page.js`)

Registration form for new farmers.

**Features:**
- Full name, farm name, email, password fields
- Password confirmation
- Form validation
- Automatic profile creation
- Redirect to dashboard on success
- Link to login page

## Authentication Flow

1. **Sign Up:**
   - User fills registration form
   - Account created in Supabase Auth
   - Profile created in profiles table
   - User redirected to dashboard

2. **Sign In:**
   - User enters email/password
   - Supabase authenticates user
   - Profile fetched from database
   - User redirected to dashboard

3. **Session Management:**
   - Sessions persist automatically
   - Auto-refresh tokens
   - Auth state updates on changes

4. **Protected Routes:**
   - AuthGuard checks authentication
   - Redirects to login if not authenticated
   - Shows loading state during check

## Integration

All protected pages should wrap content with `AuthGuard`:

```jsx
export default function ProtectedPage() {
  return (
    <AuthGuard>
      <AppLayout>
        {/* Page content */}
      </AppLayout>
    </AuthGuard>
  )
}
```

## Profile Management

User profiles are automatically created on signup and include:
- `full_name`: User's full name
- `farm_name`: Farm name
- `id`: Links to auth.users

Profiles can be updated using `updateProfile()` function.

## Security

- All authentication handled by Supabase
- Row Level Security (RLS) ensures users only access their data
- Sessions managed securely by Supabase
- Passwords never stored in plain text

