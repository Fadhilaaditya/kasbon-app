-- Migration: 20260807000000_create_debts_table.sql
-- Description: Create enum, debts table, indexes, and strict Row Level Security (RLS) policies

-- 1. Create debt_type enum
CREATE TYPE public.debt_type AS ENUM ('owed_to_me', 'i_owe');

-- 2. Create debts table
CREATE TABLE public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type public.debt_type NOT NULL,
    counterpart_name TEXT NOT NULL CHECK (char_length(trim(counterpart_name)) > 0),
    amount BIGINT NOT NULL CHECK (amount > 0),
    note TEXT CHECK (char_length(note) <= 200),
    due_date DATE DEFAULT CURRENT_DATE,
    settled_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create indexes for performance on user queries & filtering
CREATE INDEX idx_debts_user_id ON public.debts(user_id);
CREATE INDEX idx_debts_user_status ON public.debts(user_id, settled_at);
CREATE INDEX idx_debts_user_type ON public.debts(user_id, type);
CREATE INDEX idx_debts_created_at ON public.debts(created_at DESC);

-- 4. Enable Row Level Security (RLS) - MANDATORY FOR SECURITY
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- 5. Strict RLS Policies - Only row owner can SELECT/INSERT/UPDATE/DELETE
CREATE POLICY "Users can view their own debts" 
ON public.debts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" 
ON public.debts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts" 
ON public.debts FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts" 
ON public.debts FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_debts_updated_at
BEFORE UPDATE ON public.debts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
