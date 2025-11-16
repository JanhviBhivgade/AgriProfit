-- ============================================================================
-- Farm Expense Tracker - Complete Database Schema
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
-- Extends Supabase auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    farm_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);

-- RLS Policies for profiles
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. CROPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on crops
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

-- Indexes for crops
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON public.crops(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_name ON public.crops(name);

-- RLS Policies for crops
-- Users can view their own crops
CREATE POLICY "Users can view own crops"
    ON public.crops
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own crops
CREATE POLICY "Users can insert own crops"
    ON public.crops
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own crops
CREATE POLICY "Users can update own crops"
    ON public.crops
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own crops
CREATE POLICY "Users can delete own crops"
    ON public.crops
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 3. EXPENSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('seeds', 'fertilizers', 'pesticides', 'fuel', 'labor', 'equipment', 'water', 'other')),
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL,
    quantity DECIMAL(10, 2),
    unit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Indexes for expenses
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_crop_id ON public.expenses(crop_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date DESC);

-- RLS Policies for expenses
-- Users can view their own expenses
CREATE POLICY "Users can view own expenses"
    ON public.expenses
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own expenses
CREATE POLICY "Users can insert own expenses"
    ON public.expenses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own expenses
CREATE POLICY "Users can update own expenses"
    ON public.expenses
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own expenses
CREATE POLICY "Users can delete own expenses"
    ON public.expenses
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 4. YIELDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.yields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity >= 0),
    unit TEXT NOT NULL,
    sale_price DECIMAL(12, 2) NOT NULL CHECK (sale_price >= 0),
    total_revenue DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * sale_price) STORED,
    harvest_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on yields
ALTER TABLE public.yields ENABLE ROW LEVEL SECURITY;

-- Indexes for yields
CREATE INDEX IF NOT EXISTS idx_yields_user_id ON public.yields(user_id);
CREATE INDEX IF NOT EXISTS idx_yields_crop_id ON public.yields(crop_id);
CREATE INDEX IF NOT EXISTS idx_yields_harvest_date ON public.yields(harvest_date);
CREATE INDEX IF NOT EXISTS idx_yields_user_harvest_date ON public.yields(user_id, harvest_date DESC);

-- RLS Policies for yields
-- Users can view their own yields
CREATE POLICY "Users can view own yields"
    ON public.yields
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own yields
CREATE POLICY "Users can insert own yields"
    ON public.yields
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own yields
CREATE POLICY "Users can update own yields"
    ON public.yields
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own yields
CREATE POLICY "Users can delete own yields"
    ON public.yields
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 5. TRIGGER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_crops
    BEFORE UPDATE ON public.crops
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_expenses
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_yields
    BEFORE UPDATE ON public.yields
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 6. FUNCTION TO AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================================

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, farm_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'farm_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 7. HELPER FUNCTIONS (Optional but useful)
-- ============================================================================

-- Function to get user's total expenses for a date range
CREATE OR REPLACE FUNCTION public.get_user_expenses_sum(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_amount DECIMAL,
    category TEXT,
    expense_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(e.amount), 0) as total_amount,
        e.category,
        COUNT(*) as expense_count
    FROM public.expenses e
    WHERE e.user_id = p_user_id
        AND (p_start_date IS NULL OR e.date >= p_start_date)
        AND (p_end_date IS NULL OR e.date <= p_end_date)
    GROUP BY e.category
    ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's total revenue for a date range
CREATE OR REPLACE FUNCTION public.get_user_revenue_sum(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL;
BEGIN
    SELECT COALESCE(SUM(total_revenue), 0) INTO total
    FROM public.yields
    WHERE user_id = p_user_id
        AND (p_start_date IS NULL OR harvest_date >= p_start_date)
        AND (p_end_date IS NULL OR harvest_date <= p_end_date);
    RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

