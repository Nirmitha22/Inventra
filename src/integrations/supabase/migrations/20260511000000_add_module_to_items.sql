-- Add module column to items table for retail/household separation
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS module TEXT NOT NULL DEFAULT 'retail';
