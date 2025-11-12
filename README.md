# Agriprofit - Farm Input Expense Tracker

A modern Next.js 14 application for tracking and managing farm input expenses.

## Features

- Track farm input expenses
- Generate reports and analytics
- Export data to PDF and Excel
- Modern UI with shadcn/ui components
- Responsive design with Tailwind CSS

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/              # Next.js 14 app directory
├── components/       # Reusable React components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and configurations
└── public/           # Static assets
```

## Tech Stack

- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Supabase** - Backend and database
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **date-fns** - Date utilities

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

# Your Supabase anonymous/public key (safe to expose in client-side code)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Your Supabase service role key (KEEP THIS SECRET - only use on server-side)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important:** 
- Get these values from your Supabase project settings: https://app.supabase.com
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges and should never be exposed to the client
- Never commit `.env.local` to version control (it's already in `.gitignore`)

## Database Setup

### Setting up the Database Schema

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Open the file `database_schema.sql` from the project root
4. Copy and paste the entire SQL content into the SQL Editor
5. Click **Run** to execute the migration

Alternatively, you can use the migration file in `supabase/migrations/001_initial_schema.sql` if you're using Supabase CLI.

### Database Tables

The schema includes the following tables:

- **profiles** - User profile information (extends auth.users)
- **crops** - Crop information for each user
- **expenses** - Farm input expenses with categories (seeds, fertilizers, pesticides, fuel, labor, equipment, water, other)
- **yields** - Crop yields and revenue tracking

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Automatic profile creation on user signup
- All policies are user-scoped using `auth.uid()`

See `supabase/README.md` for more detailed database documentation.

