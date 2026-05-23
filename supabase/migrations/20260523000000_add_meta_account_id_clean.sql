-- Migration: Add meta_account_id_clean column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS meta_account_id_clean text;
