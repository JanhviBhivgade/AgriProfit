# Supabase Database Setup

This directory contains SQL migration files for setting up the Farm Expense Tracker database.

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/001_initial_schema.sql`
4. Copy and paste the entire SQL content into the SQL Editor
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Database Schema

The migration creates the following tables:

### 1. `profiles`
- Extends Supabase `auth.users` with additional profile information
- Fields: `id`, `full_name`, `farm_name`, `created_at`, `updated_at`

### 2. `crops`
- Stores crop information for each user
- Fields: `id`, `user_id`, `name`, `description`, `created_at`, `updated_at`

### 3. `expenses`
- Tracks farm input expenses
- Fields: `id`, `user_id`, `crop_id`, `category`, `description`, `amount`, `date`, `quantity`, `unit`, `created_at`, `updated_at`
- Categories: `seeds`, `fertilizers`, `pesticides`, `fuel`, `labor`, `equipment`, `water`, `other`

### 4. `yields`
- Records crop yields and revenue
- Fields: `id`, `user_id`, `crop_id`, `quantity`, `unit`, `sale_price`, `total_revenue` (calculated), `harvest_date`, `created_at`, `updated_at`

## Security Features

- **Row Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- Automatic profile creation when a user signs up
- All policies are user-scoped using `auth.uid()`

## Helper Functions

The migration includes helper functions:

- `get_user_expenses_sum()` - Get total expenses by category for a date range
- `get_user_revenue_sum()` - Get total revenue for a date range

## Notes

- All tables use UUID primary keys
- Foreign keys have appropriate CASCADE/SET NULL behavior
- Indexes are created for optimal query performance
- Automatic `updated_at` timestamps via triggers
- `total_revenue` in yields table is automatically calculated

