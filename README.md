# Agriprofit - Farm Input Expense Tracker

A modern Next.js 14 application for tracking and managing farm input expenses.

## Features

- Track farm input expenses
- Generate reports and analytics
- Export data to PDF and Excel
- AI-powered crop planning and budget estimation
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

# AI Provider Configuration for AI Crop Planner
# Set AI_PROVIDER to: "openrouter" (recommended), "gemini" (free), "groq" (free), or "openai" (paid)

# Option 1: OpenRouter (RECOMMENDED - Access to multiple models including OpenAI)
# Get API key from: https://openrouter.ai/keys
# Supports OpenAI models and many others without quota issues
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key
# Optional: OPENROUTER_MODEL (defaults to "openai/gpt-4o")
# Popular options: "openai/gpt-4o", "openai/gpt-4-turbo", "openai/gpt-3.5-turbo"
# See all models: https://openrouter.ai/models

# Option 2: Google Gemini (FREE - 2M tokens/month)
# Get free API key from: https://makersuite.google.com/app/apikey
# AI_PROVIDER=gemini
# GEMINI_API_KEY=your_gemini_api_key
# Optional: GEMINI_MODEL (defaults to "gemini-1.5-flash")
# Options: "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"

# Option 3: Groq (FREE - Very fast, generous limits)
# Get free API key from: https://console.groq.com/keys
# AI_PROVIDER=groq
# GROQ_API_KEY=your_groq_api_key
# Optional: GROQ_MODEL (defaults to "llama-3.1-70b-versatile")
# Options: "llama-3.1-70b-versatile", "mixtral-8x7b-32768", "gemma-7b-it"

# Option 4: OpenAI Direct (Requires paid credits)
# Get API key from: https://platform.openai.com/api-keys
# AI_PROVIDER=openai
# OPENAI_API_KEY=your_openai_api_key
# Optional: OPENAI_MODEL (defaults to "gpt-4o")
# Options: "gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"
```

**Important:** 
- Get Supabase values from your Supabase project settings: https://app.supabase.com
- **For AI Crop Planner:**
  - **OpenRouter** (Recommended): Get API key from https://openrouter.ai/keys - Access to OpenAI models and many others without quota issues
  - **Google Gemini** (Free): Get free API key from https://makersuite.google.com/app/apikey (2M tokens/month free)
  - **Groq** (Free): Get free API key from https://console.groq.com/keys (Very fast, generous free tier)
  - **OpenAI Direct**: Requires paid credits from https://platform.openai.com/api-keys
- The `SUPABASE_SERVICE_ROLE_KEY` and API keys have admin privileges and should never be exposed to the client
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

