-- Add associations array column to words table
-- This allows storing multiple mnemonic association variants per word
ALTER TABLE public.words
  ADD COLUMN IF NOT EXISTS associations text[] NOT NULL DEFAULT '{}';
